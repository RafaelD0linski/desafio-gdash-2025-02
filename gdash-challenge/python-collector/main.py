import os
import json
import time
import requests
import pika
import schedule
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configurações
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')
LOCATION = os.getenv('LOCATION', 'Pato Branco')
LATITUDE = float(os.getenv('LATITUDE', -26.2286))
LONGITUDE = float(os.getenv('LONGITUDE', -52.6708))
INTERVAL_MINUTES = int(os.getenv('INTERVAL_MINUTES', 60))
QUEUE_NAME = os.getenv('QUEUE_NAME', 'weather_data')

# Mapeamento de códigos meteorológicos
WEATHER_CONDITIONS = {
    0: 'Céu limpo',
    1: 'Principalmente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Neblina',
    48: 'Neblina gelada',
    51: 'Garoa leve',
    53: 'Garoa moderada',
    55: 'Garoa intensa',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve forte',
    80: 'Pancadas de chuva leves',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva fortes',
    95: 'Tempestade',
    96: 'Tempestade com granizo leve',
    99: 'Tempestade com granizo forte'
}

def print_header():
    """Imprime cabeçalho do sistema"""
    print("\n" + "="*70)
    print("🌦️  GDASH WEATHER COLLECTOR".center(70))
    print("="*70)
    print(f"📍 Localização: {LOCATION}")
    print(f"🌐 Coordenadas: {LATITUDE}, {LONGITUDE}")
    print(f"⏰ Intervalo: {INTERVAL_MINUTES} minutos")
    print(f"📡 RabbitMQ: {RABBITMQ_URL}")
    print(f"📬 Fila: {QUEUE_NAME}")
    print("="*70 + "\n")

def get_weather_data():
    """Coleta dados da API Open-Meteo"""
    try:
        print(f"🔄 [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Coletando dados climáticos...")
        
        url = 'https://api.open-meteo.com/v1/forecast'
        params = {
            'latitude': LATITUDE,
            'longitude': LONGITUDE,
            'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,pressure_msl,weather_code',
            'hourly': 'precipitation_probability',
            'timezone': 'America/Sao_Paulo'
        }
        
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        current = data['current']
        hourly = data['hourly']
        
        # Determina condição meteorológica
        weather_code = current.get('weather_code', 0)
        condition = WEATHER_CONDITIONS.get(weather_code, 'Desconhecido')
        
        # Pega probabilidade de precipitação da hora atual
        precipitation_prob = 0
        if hourly.get('precipitation_probability'):
            precipitation_prob = hourly['precipitation_probability'][0]
        
        # Monta objeto de dados
        weather_data = {
            'location': LOCATION,
            'latitude': LATITUDE,
            'longitude': LONGITUDE,
            'temperature': round(current['temperature_2m'], 1),
            'humidity': round(current['relative_humidity_2m'], 1),
            'windSpeed': round(current['wind_speed_10m'], 1),
            'condition': condition,
            'weatherCode': weather_code,
            'precipitationProbability': precipitation_prob,
            'pressure': round(current.get('pressure_msl', 0), 1),
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        
        print(f"✅ Dados coletados com sucesso:")
        print(f"   🌡️  Temperatura: {weather_data['temperature']}°C")
        print(f"   💧 Umidade: {weather_data['humidity']}%")
        print(f"   💨 Vento: {weather_data['windSpeed']} km/h")
        print(f"   ☁️  Condição: {condition}")
        
        return weather_data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro na requisição HTTP: {e}")
        return None
    except Exception as e:
        print(f"❌ Erro inesperado ao coletar dados: {e}")
        return None

def send_to_queue(data):
    """Envia dados para a fila RabbitMQ"""
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Conecta ao RabbitMQ
            connection = pika.BlockingConnection(
                pika.URLParameters(RABBITMQ_URL)
            )
            channel = connection.channel()
            
            # Declara a fila (garante que existe)
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            
            # Envia mensagem
            channel.basic_publish(
                exchange='',
                routing_key=QUEUE_NAME,
                body=json.dumps(data),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Mensagem persistente
                    content_type='application/json'
                )
            )
            
            connection.close()
            print(f"📤 Dados enviados para a fila '{QUEUE_NAME}' com sucesso!\n")
            return True
            
        except pika.exceptions.AMQPConnectionError as e:
            retry_count += 1
            if retry_count < max_retries:
                wait_time = retry_count * 2
                print(f"⚠️  Erro de conexão com RabbitMQ. Tentativa {retry_count}/{max_retries}")
                print(f"   Aguardando {wait_time}s antes de tentar novamente...")
                time.sleep(wait_time)
            else:
                print(f"❌ Falha ao conectar ao RabbitMQ após {max_retries} tentativas: {e}\n")
                return False
                
        except Exception as e:
            print(f"❌ Erro inesperado ao enviar para fila: {e}\n")
            return False
    
    return False

def collect_and_send():
    """Função principal: coleta dados e envia para fila"""
    try:
        # Coleta dados
        weather_data = get_weather_data()
        
        if weather_data:
            # Envia para fila
            send_to_queue(weather_data)
        else:
            print("⚠️  Pulando envio devido a erro na coleta\n")
            
    except Exception as e:
        print(f"❌ Erro no processo de coleta e envio: {e}\n")

def main():
    """Função principal do collector"""
    print_header()
    
    # Aguarda RabbitMQ estar pronto
    print("⏳ Aguardando RabbitMQ estar pronto...")
    time.sleep(10)
    print("✅ Iniciando coleta de dados\n")
    
    # Executa imediatamente ao iniciar
    collect_and_send()
    
    # Agenda coletas periódicas
    schedule.every(INTERVAL_MINUTES).minutes.do(collect_and_send)
    
    print(f"✅ Scheduler configurado. Próxima coleta em {INTERVAL_MINUTES} minutos.")
    print(f"🔄 Sistema em execução contínua...\n")
    
    # Loop infinito
    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n⚠️  Collector interrompido pelo usuário")
            break
        except Exception as e:
            print(f"❌ Erro no loop principal: {e}")
            time.sleep(5)

if __name__ == '__main__':
    main()
