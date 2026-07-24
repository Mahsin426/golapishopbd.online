import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: [
      'https://www.golapishop.online',
      'https://golapishop.online',
      /\.netlify\.app$/,
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  // সব DTO-তে whitelist validation — client থেকে অনির্ধারিত ফিল্ড এলে বাতিল
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Golapi Shop backend running on port ${port}`);
}
bootstrap();
