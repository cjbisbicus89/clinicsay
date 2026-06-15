import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { DomainExceptionFilter } from "./core/filters/domain-exception.filter";
import { GlobalExceptionFilter } from "./core/filters/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new DomainExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle("ClinicSay - Patient Alerts API")
    .setDescription("API for managing clinical alerts in patient records")
    .setVersion("1.0")
    .addTag("patient-alerts", "Clinical alerts management")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3000);
}

bootstrap();
