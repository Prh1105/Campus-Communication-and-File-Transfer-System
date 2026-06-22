import { Module } from '@nestjs/common';
import { InterceptorService } from './interceptor.service';
import { ResponseModule } from '../response/response.module';

@Module({
  imports: [ResponseModule],
  providers: [InterceptorService],
  exports: [InterceptorService],
})
export class InterceptorModule {}
