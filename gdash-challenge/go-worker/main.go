package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// WeatherData representa os dados climáticos
type WeatherData struct {
	Location                 string    `json:"location"`
	Latitude                 float64   `json:"latitude"`
	Longitude                float64   `json:"longitude"`
	Temperature              float64   `json:"temperature"`
	Humidity                 float64   `json:"humidity"`
	WindSpeed                float64   `json:"windSpeed"`
	Condition                string    `json:"condition"`
	WeatherCode              int       `json:"weatherCode"`
	PrecipitationProbability float64   `json:"precipitationProbability"`
	Pressure                 float64   `json:"pressure"`
	Timestamp                time.Time `json:"timestamp"`
}

const (
	maxRetries     = 3
	retryDelay     = 2 * time.Second
	reconnectDelay = 5 * time.Second
)

var (
	rabbitmqURL = getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
	apiURL      = getEnv("API_URL", "http://localhost:3000")
	queueName   = getEnv("QUEUE_NAME", "weather_data")
)

func main() {
	printHeader()

	// Aguarda serviços estarem prontos
	log.Println("⏳ Aguardando RabbitMQ e API estarem prontos...")
	time.Sleep(15 * time.Second)

	for {
		err := startWorker()
		if err != nil {
			log.Printf("❌ Worker parou com erro: %v", err)
			log.Printf("🔄 Reconectando em %v...\n", reconnectDelay)
			time.Sleep(reconnectDelay)
		}
	}
}

func printHeader() {
	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println(centerText("🔷 GDASH GO WORKER", 70))
	fmt.Println(strings.Repeat("=", 70))
	fmt.Printf("📡 RabbitMQ: %s\n", rabbitmqURL)
	fmt.Printf("🔗 API URL: %s\n", apiURL)
	fmt.Printf("📬 Fila: %s\n", queueName)
	fmt.Println(strings.Repeat("=", 70) + "\n")
}

func startWorker() error {
	// Conecta ao RabbitMQ
	conn, err := amqp.Dial(rabbitmqURL)
	if err != nil {
		return fmt.Errorf("falha ao conectar ao RabbitMQ: %w", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return fmt.Errorf("falha ao abrir canal: %w", err)
	}
	defer ch.Close()

	// Declara a fila
	q, err := ch.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		return fmt.Errorf("falha ao declarar fila: %w", err)
	}

	// Define QoS
	err = ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		return fmt.Errorf("falha ao definir QoS: %w", err)
	}

	// Registra consumer
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		return fmt.Errorf("falha ao registrar consumer: %w", err)
	}

	log.Println("✅ Worker iniciado. Aguardando mensagens...")
	log.Println("🔄 Pressione CTRL+C para parar\n")

	// Processa mensagens
	forever := make(chan bool)

	go func() {
		for d := range msgs {
			processMessage(d, ch)
		}
	}()

	<-forever
	return nil
}

func processMessage(d amqp.Delivery, ch *amqp.Channel) {
	log.Printf("📥 Mensagem recebida [%s]", time.Now().Format("15:04:05"))

	var weatherData WeatherData
	err := json.Unmarshal(d.Body, &weatherData)
	if err != nil {
		log.Printf("❌ Erro ao fazer parse do JSON: %v", err)
		d.Nack(false, false) // Rejeita sem requeue
		return
	}

	// Valida dados
	if !validateWeatherData(weatherData) {
		log.Println("⚠️  Dados inválidos. Rejeitando mensagem.")
		d.Nack(false, false)
		return
	}

	log.Printf("   📊 Temp: %.1f°C | Umidade: %.1f%% | Local: %s",
		weatherData.Temperature,
		weatherData.Humidity,
		weatherData.Location)

	// Envia para API com retry
	success := sendToAPI(weatherData)

	if success {
		log.Println("✅ Dados enviados para API com sucesso\n")
		d.Ack(false)
	} else {
		log.Println("❌ Falha ao enviar para API após tentativas")
		d.Nack(false, true) // Rejeita e requeue
	}
}

func validateWeatherData(data WeatherData) bool {
	if data.Location == "" {
		log.Println("   ⚠️  Local vazio")
		return false
	}
	if data.Temperature < -100 || data.Temperature > 100 {
		log.Printf("   ⚠️  Temperatura fora do range: %.1f°C", data.Temperature)
		return false
	}
	if data.Humidity < 0 || data.Humidity > 100 {
		log.Printf("   ⚠️  Umidade fora do range: %.1f%%", data.Humidity)
		return false
	}
	return true
}

func sendToAPI(data WeatherData) bool {
	endpoint := fmt.Sprintf("%s/api/weather/logs", apiURL)

	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Printf("❌ Erro ao serializar JSON: %v", err)
		return false
	}

	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt > 1 {
			waitTime := time.Duration(attempt) * retryDelay
			log.Printf("   ⏳ Tentativa %d/%d em %v...", attempt, maxRetries, waitTime)
			time.Sleep(waitTime)
		}

		req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonData))
		if err != nil {
			log.Printf("   ❌ Erro ao criar requisição: %v", err)
			continue
		}

		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("   ❌ Erro HTTP (tentativa %d): %v", attempt, err)
			continue
		}

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			resp.Body.Close()
			log.Printf("   ✅ API respondeu: %d", resp.StatusCode)
			return true
		}

		log.Printf("   ⚠️  API respondeu: %d (tentativa %d)", resp.StatusCode, attempt)
		resp.Body.Close()
	}

	return false
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func centerText(text string, width int) string {
	padding := (width - len(text)) / 2
	return strings.Repeat(" ", padding) + text
}
