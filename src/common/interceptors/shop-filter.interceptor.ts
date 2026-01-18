import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ShopFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get shopId from token first (highest priority), then query params, body, or cookies
    let shopId = user.shopId || request.query.shopId || request.body?.shopId || request.cookies?.shopId;

    if (!shopId) {
      throw new BadRequestException('shopId is required. User must be connected to a shop (in token), or provide it as query parameter, in request body, or in cookies');
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
