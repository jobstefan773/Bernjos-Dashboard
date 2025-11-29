import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Default API to 3001 to avoid clashing with Next.js dev server on 3000
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  // Simple boot log to confirm server started
  console.log(`API running at http://localhost:${port}`);
}

bootstrap();
