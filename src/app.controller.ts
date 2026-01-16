import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('root')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  getHello(): string {
    return 'Hello World!';
  }
}

