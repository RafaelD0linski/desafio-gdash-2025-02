"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const weather_schema_1 = require("./weather.schema");
let WeatherService = class WeatherService {
    constructor(weatherModel) {
        this.weatherModel = weatherModel;
    }
    async create(createWeatherDto) {
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
    generateAIInsight(data) {
        const { temperature, humidity, windSpeed, precipitationProbability } = data;
        let insight = "";
        if (temperature > 30)
            insight += "Dia quente. ";
        else if (temperature < 15)
            insight += "Dia frio. ";
        else
            insight += "Temperatura agradável. ";
        if (humidity > 70)
            insight += "Alta umidade pode causar desconforto. ";
        if (precipitationProbability > 60)
            insight += "Alta probabilidade de chuva. ";
        if (windSpeed > 30)
            insight += "Ventos fortes. ";
        return insight.trim();
    }
    calculateComfortScore(data) {
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
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(weather_schema_1.WeatherLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WeatherService);
//# sourceMappingURL=weather.service.js.map