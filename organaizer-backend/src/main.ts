import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Définir un préfixe global pour toutes les routes
  app.setGlobalPrefix('api');

  // 1b. Security headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", ...((process.env.CORS_ORIGIN ?? '').split(',').map(s => s.trim()).filter(Boolean))],
      },
    } : false,
  }));

  // 2. Servir les fichiers statiques (photos uploadées)
  const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
  app.use('/uploads', express.static(join(__dirname, '..', uploadsDir)));

  // 3. Activer CORS pour autoriser les requêtes du frontend
  app.enableCors({
    origin: (origin, cb) => {
      const allowed = (process.env.CORS_ORIGIN ?? '').split(',').map(s => s.trim()).filter(Boolean);
      if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'), false);
    },
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

  // Static uploads already configured above via UPLOADS_DIR

  // 5. Lancer le serveur sur le port 3001 pour correspondre au frontend
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
