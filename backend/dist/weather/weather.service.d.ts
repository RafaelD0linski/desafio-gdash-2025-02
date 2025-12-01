import { Model } from "mongoose";
import { WeatherLog } from "./weather.schema";
import { CreateWeatherDto } from "./dto/create-weather.dto";
export declare class WeatherService {
    private weatherModel;
    constructor(weatherModel: Model<WeatherLog>);
    create(createWeatherDto: CreateWeatherDto): Promise<import("mongoose").Document<unknown, {}, WeatherLog, {}, {}> & WeatherLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(limit?: number): Promise<(import("mongoose").Document<unknown, {}, WeatherLog, {}, {}> & WeatherLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getLatest(): Promise<import("mongoose").Document<unknown, {}, WeatherLog, {}, {}> & WeatherLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private generateAIInsight;
    private calculateComfortScore;
}
