import { IsString, IsNumber, IsDate, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateWeatherDto {
  @IsString()
  location: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  windSpeed: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsNumber()
  weatherCode?: number;

  @IsOptional()
  @IsNumber()
  precipitationProbability?: number;

  @IsOptional()
  @IsNumber()
  pressure?: number;

  @Type(() => Date)
  @IsDate()
  timestamp: Date;
}
