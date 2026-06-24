import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InterceptorService } from '@libs/shared';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局响应拦截器 —— 自动将返回值包装为标准 API 格式
  const interceptor = app.get(InterceptorService);
  app.useGlobalInterceptors(interceptor);

  // CORS（开发环境）
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  // 静态文件服务 —— 上传的文件通过 /uploads 访问
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // API 全局前缀
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📁 Static files served from: ${join(__dirname, '..', 'uploads')}`);
}

bootstrap();
