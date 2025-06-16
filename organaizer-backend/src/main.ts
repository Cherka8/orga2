import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Renvoie une erreur si des propriétés non définies sont présentes
      transform: true, // Transforme le payload en instance du DTO (ex: string en number si typé)
    }),
  );
  app.enableCors({
    origin: 'http://localhost:3001', // Spécifie l'origine du frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Autorise l'envoi de cookies ou d'en-têtes d'authentification
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
