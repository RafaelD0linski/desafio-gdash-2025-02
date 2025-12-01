import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UsersService } from "./users/users.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  });

  const usersService = app.get(UsersService);
  await usersService.createDefaultAdmin();

  await app.listen(3000);
  console.log("🚀 API rodando em http://localhost:3000");
}
bootstrap();
