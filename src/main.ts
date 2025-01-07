import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));  



  app.enableCors({
    origin: 'http://localhost:3000', // URL dari aplikasi frontend Anda (Next.js)
    credentials: true, // Mengizinkan pengiriman cookies atau header Authorization
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Metode HTTP yang diizinkan
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
    ],
  });
  
  // await seedDatabase(source);
  await app.listen(8000);

}
bootstrap();


function cors(arg0: {
  origin: string; // Your Next.js frontend URL
  credentials: boolean; methods: string[]; allowedHeaders: string[];
}): any {
  throw new Error('Function not implemented.');
}

