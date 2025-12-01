import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class WeatherLog extends Document {
  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  windSpeed: number;

  @Prop()
  condition: string;

  @Prop()
  weatherCode: number;

  @Prop()
  precipitationProbability: number;

  @Prop()
  pressure: number;

  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop()
  aiInsight: string;

  @Prop()
  comfortScore: number;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
