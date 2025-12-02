import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { WeatherModule } from "./weather/weather.module";

@Module({
  imports: [
    // Carrega variáveis do .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Conexão com MongoDB - SEM OPÇÕES ANTIGAS
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    UsersModule,
    WeatherModule,
  ],
})
export class AppModule {}
