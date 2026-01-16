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

    if (!user?.shopId) {
      throw new ForbiddenException('User is not associated with any shop');
    }

    // Check if item exists and belongs to user's shop
    const item = await this.prisma.item.findUnique({
      where: { id: parseInt(itemId) },
      select: { shopId: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.shopId !== user.shopId) {
      throw new ForbiddenException('You do not have access to this item');
    }

    return true;
  }
}
