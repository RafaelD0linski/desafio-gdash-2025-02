import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { WeatherService } from "./weather.service";
import { CreateWeatherDto } from "./dto/create-weather.dto";

@Controller("weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post("logs")
  create(@Body() dto: CreateWeatherDto) {
    return this.weatherService.create(dto);
  }

  @Get("logs")
  findAll(@Query("limit") limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return this.weatherService.findAll(limitNumber);
  }

  @Get("latest")
  getLatest() {
    return this.weatherService.getLatest();
  }
}
