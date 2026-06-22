import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { InterceptorModule } from './interceptor/interceptor.module';
import { ResponseService } from './response/response.service';
import { ResponseModule } from './response/response.module';

@Global()
@Module({
  providers: [SharedService, ResponseService],
  exports: [SharedService, PrismaModule, InterceptorModule, ResponseModule],
  imports: [PrismaModule, InterceptorModule, ResponseModule],
})
export class SharedModule {}
