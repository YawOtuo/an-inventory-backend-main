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
    await this.prisma.user.update({
      where: { id: userId },
      data: {
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
    return this.prisma.user.findMany({
      where: { shopId },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        shopId: true,
        acceptedIntoShop: true,
        permission: true,
        uid: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getShopAcceptedUsers(shopId: number) {
    return this.prisma.user.findMany({
      where: {
        shopId,
        acceptedIntoShop: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        shopId: true,
        acceptedIntoShop: true,
        permission: true,
        uid: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getShopUnacceptedUsers(shopId: number) {
    return this.prisma.user.findMany({
      where: {
        shopId,
        acceptedIntoShop: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        shopId: true,
        acceptedIntoShop: true,
        permission: true,
        uid: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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
}

