import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseService } from '../response/response.service';

/**
 * 全局响应拦截器
 *
 * 职责：
 * 1. 将 controller 返回的原始数据自动包装为标准 API 格式
 * 2. 记录每个请求的 method、url、状态码和耗时
 * 3. 自动跳过已是标准格式的响应，避免二次包装
 *
 * @example
 * // controller 中直接返回数据即可：
 * @Get()
 * findAll() {
 *   return this.userService.findAll(); // { code: 200, message: '...', data: [...], timestamp: '...' }
 * }
 */
@Injectable()
export class InterceptorService implements NestInterceptor {
  private readonly logger = new Logger(InterceptorService.name);

  constructor(private readonly responseService: ResponseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = Date.now() - startTime;

        this.logger.log(`${method} ${url} → ${statusCode} (${duration}ms)`);

        // 已经是标准格式则直接放行，避免二次包装
        if (this.responseService.isStandardFormat(data)) {
          return data;
        }

        // 自动包装为标准格式
        return this.responseService.success(data, '操作成功', statusCode);
      }),
    );
  }
}
