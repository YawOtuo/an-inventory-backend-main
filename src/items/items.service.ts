import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async getAllItems(shopId: number, page: number = 1, perPage: number = 10) {
    const offset = (page - 1) * perPage;

    const [items, totalItems] = await Promise.all([
      this.prisma.item.findMany({
        where: { shopId }, // Filter by shop
        orderBy: { createdAt: 'desc' },
        take: perPage,
        skip: offset,
      }),
      this.prisma.item.count({
        where: { shopId }, // Filter by shop
      }),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
      items,
    };
  }

  async getOneItem(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async addItem(itemData: any) {
    return this.prisma.item.create({
      data: itemData,
    });
  }

  async updateItem(id: number, itemData: any) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.item.update({
      where: { id },
      data: itemData,
    });
  }

  async deleteItem(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.item.delete({
      where: { id },
    });
  }

  async searchItem(keyword: string, shopId: number) {
    return this.prisma.item.findMany({
      where: {
        shopId, // Filter by shop
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      },
    });
  }

  async getItemsBelowRefillLimit(shopId: number) {
    const defaultRefillLimit = 5;

    // Get all items for the shop
    const items = await this.prisma.item.findMany({
      where: { shopId },
    });

    // Filter items where quantity is less than refill_count (or defaultRefillLimit if refill_count is null)
    const filteredItems = items.filter((item) => {
      const refillLimit = item.refill_count ?? defaultRefillLimit;
      return (item.quantity ?? 0) < refillLimit;
    });

    return filteredItems;
  }
}

