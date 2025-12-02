package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	Timestamp            string  `json:"timestamp"`
	Location             string  `json:"location"`
	Latitude             float64 `json:"latitude"`
	Longitude            float64 `json:"longitude"`
	Temperature          float64 `json:"temperature"`
	Humidity             float64 `json:"humidity"`
	WindSpeed            float64 `json:"windSpeed"`
	WeatherCode          int     `json:"weatherCode"`
	WeatherDescription   string  `json:"weatherDescription"`
	Precipitation        float64 `json:"precipitation"`
	ApparentTemperature  float64 `json:"apparentTemperature"`
	CloudCover           float64 `json:"cloudCover"`
	Pressure             float64 `json:"pressure"`
	CollectedAt          string  `json:"collectedAt"`
}

func main() {
	rabbitmqURL := getEnv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672")
	apiURL := getEnv("API_URL", "http://backend:3000")
	queueName := getEnv("QUEUE_NAME", "weather_data")

	fmt.Println("=" + strings.Repeat("=", 68))
	fmt.Println("🚀 GDASH Go Worker - Iniciado")
	fmt.Println("=" + strings.Repeat("=", 68))
	fmt.Printf("🔄 RabbitMQ: %s\n", rabbitmqURL)
	fmt.Printf("🌐 API Backend: %s\n", apiURL)
	fmt.Printf("📦 Fila: %s\n", queueName)
	fmt.Println("=" + strings.Repeat("=", 68))

	// Conectar com retry
	var conn *amqp.Connection
	var err error
	
	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(rabbitmqURL)
		if err == nil {
			break
		}
		log.Printf("⚠️  Tentativa %d/10 de conectar ao RabbitMQ...", i+1)
		time.Sleep(5 * time.Second)
	}
	
	if err != nil {
		log.Fatalf("❌ Falha ao conectar: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("❌ Erro ao abrir canal: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(queueName, true, false, false, false, nil)
	if err != nil {
		log.Fatalf("❌ Erro ao declarar fila: %v", err)
	}

	err = ch.Qos(1, 0, false)
	if err != nil {
		log.Fatalf("❌ Erro no QoS: %v", err)
	}

	msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
	if err != nil {
		log.Fatalf("❌ Erro ao consumir: %v", err)
	}

	log.Println("✅ Aguardando mensagens...")
	log.Println(strings.Repeat("-", 70))

	forever := make(chan bool)

	go func() {
		for msg := range msgs {
			processMessage(msg, apiURL)
		}
	}()

	<-forever
}

func processMessage(msg amqp.Delivery, apiURL string) {
	log.Printf("\n📨 Mensagem recebida")

	var data WeatherData
	if err := json.Unmarshal(msg.Body, &data); err != nil {
		log.Printf("❌ Erro no parse: %v", err)
		msg.Nack(false, false)
		return
	}

	log.Printf("   📍 %s", data.Location)
	log.Printf("   🌡️  %.1f°C", data.Temperature)
	log.Printf("   💧 %.0f%%", data.Humidity)

	if sendToAPI(data, apiURL) {
		log.Println("✅ Enviado para API com sucesso")
		msg.Ack(false)
	} else {
		log.Println("⚠️  Falha - Reenfileirando...")
		msg.Nack(false, true)
	}
	
	log.Println(strings.Repeat("-", 70))
}

func sendToAPI(data WeatherData, apiURL string) bool {
	endpoint := fmt.Sprintf("%s/api/weather", apiURL)

	jsonData, _ := json.Marshal(data)
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return false
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Erro HTTP: %v", err)
		return false
	}
	defer resp.Body.Close()

	return resp.StatusCode >= 200 && resp.StatusCode < 300
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
