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

    // Get shopId from query params or body
    const shopId = request.query.shopId || request.body?.shopId;

    if (!shopId) {
      throw new BadRequestException('shopId is required as query parameter or in request body');
    }

    const shopIdNum = parseInt(shopId.toString());
    if (isNaN(shopIdNum)) {
      throw new BadRequestException('shopId must be a valid number');
    }

    // Verify user belongs to this shop
    // Note: This requires a database call, so we'll do it asynchronously
    // For now, we'll just add shopId to the request and let the service/guard verify
    (request as any).shopId = shopIdNum;

    // Ensure shopId is in query params for easy access
    if (!request.query.shopId) {
      request.query.shopId = shopIdNum.toString();
    }

    return next.handle();
  }
}
