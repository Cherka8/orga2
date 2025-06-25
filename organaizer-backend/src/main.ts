import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Définir un préfixe global pour toutes les routes
  app.setGlobalPrefix('api');

  // 2. Servir les fichiers statiques (photos uploadées)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 3. Activer CORS pour autoriser les requêtes du frontend
  app.enableCors({
    origin: 'http://localhost:3000', // L'URL de votre frontend React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. Utiliser un ValidationPipe global pour la validation des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Servir les fichiers statiques depuis le dossier 'public'
  app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));

  // 5. Lancer le serveur sur le port 3001 pour correspondre au frontend
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
