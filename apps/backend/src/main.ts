import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InterceptorService } from '@libs/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局响应拦截器 —— 自动将返回值包装为标准 API 格式
  const interceptor = app.get(InterceptorService);
  app.useGlobalInterceptors(interceptor);

  // CORS（开发环境）
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  // API 全局前缀
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

bootstrap();
