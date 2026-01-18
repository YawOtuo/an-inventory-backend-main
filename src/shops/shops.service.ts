import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async getAllShops() {
    return this.prisma.shop.findMany();
  }

  async getShopById(id: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async createShop(shopData: { name: string }, userId: number) {
    // Create the shop
    const shop = await this.prisma.shop.create({
      data: {
        name: shopData.name,
      },
    });

    // Automatically connect the user who created the shop to it
    // and set them as accepted since they're the creator
    await this.prisma.userShop.create({
      data: {
        userId: userId,
        shopId: shop.id,
        acceptedIntoShop: true, // Creator is automatically accepted
      },
    });

    return shop;
  }

  async updateShop(id: number, shopData: { name?: string; description?: string; address?: string; phone?: string; email?: string; website?: string }) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return this.prisma.shop.update({
      where: { id },
      data: shopData,
    });
  }

  async deleteShop(id: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.prisma.shop.delete({
      where: { id },
    });
  }

  async getShopUsers(shopId: number) {
    const userShops = await this.prisma.userShop.findMany({
      where: { shopId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
            permission: true,
            uid: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return userShops.map(us => ({
      ...us.user,
      shopId: us.shopId,
      acceptedIntoShop: us.acceptedIntoShop,
      permission: us.permission || us.user.permission,
    }));
  }

  async getShopAcceptedUsers(shopId: number) {
    const userShops = await this.prisma.userShop.findMany({
      where: {
        shopId,
        acceptedIntoShop: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
            permission: true,
            uid: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return userShops.map(us => ({
      ...us.user,
      shopId: us.shopId,
      acceptedIntoShop: us.acceptedIntoShop,
      permission: us.permission || us.user.permission,
    }));
  }

  async getShopUnacceptedUsers(shopId: number) {
    const userShops = await this.prisma.userShop.findMany({
      where: {
        shopId,
        acceptedIntoShop: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
            permission: true,
            uid: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return userShops.map(us => ({
      ...us.user,
      shopId: us.shopId,
      acceptedIntoShop: us.acceptedIntoShop,
      permission: us.permission || us.user.permission,
    }));
  }

  async verifyShopByName(name: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { name },
    });

    if (shop) {
      return shop;
    } else {
      return { exists: false, message: 'Shop does not exist in the database' };
    }
  }

  async getUserShops(userId: number) {
    const userShops = await this.prisma.userShop.findMany({
      where: { userId },
      include: { shop: true },
    });

    return userShops.map(us => us.shop);
  }
}

