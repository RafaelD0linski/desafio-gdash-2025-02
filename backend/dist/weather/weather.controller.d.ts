import { WeatherService } from "./weather.service";
import { CreateWeatherDto } from "./dto/create-weather.dto";
export declare class WeatherController {
    private readonly weatherService;
    constructor(weatherService: WeatherService);
    create(dto: CreateWeatherDto): Promise<import("mongoose").Document<unknown, {}, import("./weather.schema").WeatherLog, {}, {}> & import("./weather.schema").WeatherLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(limit?: string): Promise<(import("mongoose").Document<unknown, {}, import("./weather.schema").WeatherLog, {}, {}> & import("./weather.schema").WeatherLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getLatest(): Promise<import("mongoose").Document<unknown, {}, import("./weather.schema").WeatherLog, {}, {}> & import("./weather.schema").WeatherLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
