import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  // Default API to 3001 to avoid clashing with Next.js dev server on 3000; allow override via API_PORT
  const port = Number(process.env.API_PORT) || 3001;
  await app.listen(port);
  // Simple boot log to confirm server started
  console.log(`API running at http://localhost:${port}`);
}

bootstrap();
