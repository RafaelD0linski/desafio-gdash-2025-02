import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { WeatherModule } from "./weather/weather.module";

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://localhost:27017/gdash"),
    AuthModule,
    UsersModule,
    WeatherModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
