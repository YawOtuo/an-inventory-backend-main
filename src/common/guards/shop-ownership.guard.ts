import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShopOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const itemId = request.params.id;
    // Get shopId from token first, then query params, body, or cookies
    const shopId = user.shopId || request.query?.shopId || request.body?.shopId || request.cookies?.shopId;

    if (!shopId) {
      throw new ForbiddenException('shopId is required');
    }

    // Check if item exists and belongs to the specified shop
    const item = await this.prisma.item.findUnique({
      where: { id: parseInt(itemId) },
      select: { shopId: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.shopId !== parseInt(shopId)) {
      throw new ForbiddenException('Item does not belong to the specified shop');
    }

    // Check if user belongs to this shop
    const userShop = await this.prisma.userShop.findUnique({
      where: {
        userId_shopId: {
          userId: user.id,
          shopId: parseInt(shopId),
        },
      },
    });

    if (!userShop) {
      throw new ForbiddenException('User is not associated with this shop');
    }

    return true;
  }
}
