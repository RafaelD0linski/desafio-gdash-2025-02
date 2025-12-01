"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api");
    app.enableCors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        allowedHeaders: "Content-Type, Authorization",
    });
    await app.listen(3000);
    console.log("🚀 API rodando em http://localhost:3000");
}
bootstrap();
//# sourceMappingURL=main.js.map