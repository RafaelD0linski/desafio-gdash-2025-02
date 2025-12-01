import { Document } from "mongoose";
export declare class WeatherLog extends Document {
    location: string;
    latitude: number;
    longitude: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    weatherCode: number;
    precipitationProbability: number;
    pressure: number;
    timestamp: Date;
    aiInsight: string;
    comfortScore: number;
}
export declare const WeatherLogSchema: import("mongoose").Schema<WeatherLog, import("mongoose").Model<WeatherLog, any, any, any, Document<unknown, any, WeatherLog, any, {}> & WeatherLog & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WeatherLog, Document<unknown, {}, import("mongoose").FlatRecord<WeatherLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<WeatherLog> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
