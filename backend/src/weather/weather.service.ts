import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WeatherLog } from "./weather.schema";
import { CreateWeatherDto } from "./dto/create-weather.dto";

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>
  ) {}

  async create(createWeatherDto: CreateWeatherDto) {
    const insight = this.generateAIInsight(createWeatherDto);
    const comfortScore = this.calculateComfortScore(createWeatherDto);

    return this.weatherModel.create({
      ...createWeatherDto,
      aiInsight: insight,
      comfortScore,
    });
  }

  async findAll(limit = 100) {
    return this.weatherModel.find().sort({ timestamp: -1 }).limit(limit).exec();
  }

  async getLatest() {
    return this.weatherModel.findOne().sort({ timestamp: -1 }).exec();
  }

  private generateAIInsight(data: any): string {
    const { temperature, humidity, windSpeed, precipitationProbability } = data;
    let insight = "";

    if (temperature > 30) insight += "Dia quente. ";
    else if (temperature < 15) insight += "Dia frio. ";
    else insight += "Temperatura agradável. ";

    if (humidity > 70) insight += "Alta umidade pode causar desconforto. ";
    if (precipitationProbability > 60)
      insight += "Alta probabilidade de chuva. ";
    if (windSpeed > 30) insight += "Ventos fortes. ";

    return insight.trim();
  }

  private calculateComfortScore(data: any): number {
    const { temperature, humidity, windSpeed } = data;
    let score = 100;

    if (temperature < 18 || temperature > 26) {
      score -= Math.abs(22 - temperature) * 2;
    }

    if (humidity < 30 || humidity > 70) {
      score -= Math.abs(50 - humidity) * 0.5;
    }

    if (windSpeed > 20) {
      score -= (windSpeed - 20) * 0.5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
