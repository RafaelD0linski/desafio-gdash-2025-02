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
exports.WeatherController = void 0;
const common_1 = require("@nestjs/common");
const weather_service_1 = require("./weather.service");
const create_weather_dto_1 = require("./dto/create-weather.dto");
let WeatherController = class WeatherController {
    constructor(weatherService) {
        this.weatherService = weatherService;
    }
    create(dto) {
        return this.weatherService.create(dto);
    }
    findAll(limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 100;
        return this.weatherService.findAll(limitNumber);
    }
    getLatest() {
        return this.weatherService.getLatest();
    }
};
exports.WeatherController = WeatherController;
__decorate([
    (0, common_1.Post)("logs"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_weather_dto_1.CreateWeatherDto]),
    __metadata("design:returntype", void 0)
], WeatherController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("logs"),
    __param(0, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WeatherController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("latest"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WeatherController.prototype, "getLatest", null);
exports.WeatherController = WeatherController = __decorate([
    (0, common_1.Controller)("weather"),
    __metadata("design:paramtypes", [weather_service_1.WeatherService])
], WeatherController);
//# sourceMappingURL=weather.controller.js.map