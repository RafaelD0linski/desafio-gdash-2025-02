import os
import time
import json
import requests
import pika
from datetime import datetime


def get_weather_description(code):
    """Converte código do tempo em descrição em português"""
    codes = {
        0: "Céu limpo",
        1: "Principalmente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Nevoeiro",
        48: "Nevoeiro com geada",
        51: "Garoa leve",
        53: "Garoa moderada",
        55: "Garoa densa",
        61: "Chuva leve",
        63: "Chuva moderada",
        65: "Chuva forte",
        71: "Neve leve",
        73: "Neve moderada",
        75: "Neve forte",
        95: "Tempestade",
        96: "Tempestade com granizo leve",
        99: "Tempestade com granizo forte"
    }
    return codes.get(code, "Desconhecido")


def collect_weather():
    """Coleta dados climáticos do Open-Meteo API"""
    
    latitude = os.getenv("LATITUDE", "-26.2286")
    longitude = os.getenv("LONGITUDE", "-52.6708")
    location = os.getenv("LOCATION", "Pato Branco, PR")
    
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}&"
        f"longitude={longitude}&"
        f"current=temperature_2m,relative_humidity_2m,wind_speed_10m,"
        f"weather_code,precipitation,apparent_temperature,cloud_cover,pressure_msl&"
        f"timezone=America/Sao_Paulo"
    )
    
    try:
        print(f"\n🌤️  Coletando dados de {location}...")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        current = data["current"]
        
        weather_data = {
            "timestamp": current["time"],
            "location": location,
            "latitude": float(latitude),
            "longitude": float(longitude),
            "temperature": current["temperature_2m"],
            "humidity": current["relative_humidity_2m"],
            "windSpeed": current["wind_speed_10m"],
            "weatherCode": current["weather_code"],
            "weatherDescription": get_weather_description(current["weather_code"]),
            "precipitation": current["precipitation"],
            "apparentTemperature": current["apparent_temperature"],
            "cloudCover": current["cloud_cover"],
            "pressure": current["pressure_msl"],
            "collectedAt": datetime.now().isoformat()
        }
        
        print("✅ Dados coletados com sucesso:")
        print(f"   🌡️  Temperatura: {weather_data['temperature']}°C")
        print(f"   💧 Umidade: {weather_data['humidity']}%")
        print(f"   💨 Vento: {weather_data['windSpeed']} km/h")
        print(f"   ☁️  Condição: {weather_data['weatherDescription']}")
        
        return weather_data
        
    except Exception as e:
        print(f"❌ Erro ao coletar dados: {e}")
        return None


def send_to_queue(data):
    """Envia dados para o RabbitMQ"""
    
    rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672")
    queue_name = os.getenv("QUEUE_NAME", "weather_data")
    
    max_retries = 5
    
    for attempt in range(max_retries):
        try:
            params = pika.URLParameters(rabbitmq_url)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            
            channel.queue_declare(queue=queue_name, durable=True)
            
            channel.basic_publish(
                exchange='',
                routing_key=queue_name,
                body=json.dumps(data),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    content_type='application/json'
                )
            )
            
            print(f"✅ Dados enviados para fila '{queue_name}'")
            connection.close()
            return True
            
        except Exception as e:
            print(f"⚠️  Tentativa {attempt + 1}/{max_retries}: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
    
    print(f"❌ Falha ao enviar para fila após {max_retries} tentativas")
    return False


def main():
    """Loop principal de coleta"""
    
    interval_minutes = int(os.getenv("INTERVAL_MINUTES", "60"))
    interval_seconds = interval_minutes * 60
    
    print("=" * 70)
    print("🚀 GDASH Weather Collector - Iniciado")
    print("=" * 70)
    print(f"📍 Localização: {os.getenv('LOCATION', 'Pato Branco, PR')}")
    print(f"📌 Coordenadas: {os.getenv('LATITUDE')}, {os.getenv('LONGITUDE')}")
    print(f"⏱️  Intervalo: {interval_minutes} minutos")
    print(f"🔄 Fila: {os.getenv('QUEUE_NAME', 'weather_data')}")
    print("=" * 70)
    
    # Fazer primeira coleta imediata
    print("\n🎯 Executando primeira coleta...")
    weather_data = collect_weather()
    if weather_data:
        send_to_queue(weather_data)
    
    # Loop contínuo
    while True:
        try:
            print(f"\n⏳ Próxima coleta em {interval_minutes} minutos...")
            print("-" * 70)
            time.sleep(interval_seconds)
            
            weather_data = collect_weather()
            if weather_data:
                send_to_queue(weather_data)
                
        except KeyboardInterrupt:
            print("\n\n👋 Encerrando serviço...")
            break
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")
            print("⏳ Aguardando 60 segundos...")
            time.sleep(60)


if __name__ == "__main__":
    main()
