export declare class CreateWeatherDto {
    location: string;
    latitude: number;
    longitude: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition?: string;
    weatherCode?: number;
    precipitationProbability?: number;
    pressure?: number;
    timestamp: Date;
}
