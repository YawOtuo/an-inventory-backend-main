import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ShopFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.shopId) {
      throw new BadRequestException('User is not associated with any shop');
    }

    // Add shopId to request object for easy access in services
    (request as any).shopId = user.shopId;

    // Automatically add shopId to query params if not present
    if (!request.query.shopId) {
      request.query.shopId = user.shopId.toString();
    }

    return next.handle();
  }
}
