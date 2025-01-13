import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as ngrok from 'ngrok';



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  ngrok.authtoken('2rZOXqnKFp1VS1RXaY81g3cfJUL_26c8VkYqnCQAovQgrbb9a');


  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.use(cookieParser()); 

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
  await app.listen(8000);
  
  const url = await ngrok.connect(8000); // Ganti dengan port yang sama dengan yang digunakan di app.listen()
  console.log(`Aplikasi dapat diakses melalui URL: ${url}`);


}
bootstrap();


function cors(arg0: {
  origin: string; // Your Next.js frontend URL
  credentials: boolean; methods: string[]; allowedHeaders: string[];
}): any {
  throw new Error('Function not implemented.');
}

