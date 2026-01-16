import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getAllInventoryByShop(shopId: number, page: number = 1, perPage: number = 25) {
    const offset = (page - 1) * perPage;

    const [inventories, totalItems] = await Promise.all([
      this.prisma.inventory.findMany({
        where: { shopId },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              quantity: true,
              category: true,
              createdAt: true,
              image_url: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: perPage,
        skip: offset,
      }),
      this.prisma.inventory.count({
        where: { shopId },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
      items: inventories,
    };
  }

  async addInventory(inventoryData: any) {
    return this.prisma.inventory.create({
      data: inventoryData,
    });
  }

  async updateInventory(id: number, inventoryData: any) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.inventory.update({
      where: { id },
      data: inventoryData,
    });
  }

  async deleteInventory(id: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.inventory.delete({
      where: { id },
    });
  }

  async getInventoryGeneralSums(shopId: number) {
    const today = new Date();
    const startDateDay = new Date(today);
    startDateDay.setHours(0, 0, 0, 0);

    const endDateDay = new Date(today);
    endDateDay.setHours(23, 59, 59, 999);

    const startDateWeek = new Date(today);
    startDateWeek.setDate(startDateWeek.getDate() - startDateWeek.getDay());

    const endDateWeek = new Date(today);
    endDateWeek.setDate(startDateWeek.getDate() + 6);
    endDateWeek.setHours(23, 59, 59, 999);

    const startDateMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDateMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endDateMonth.setHours(23, 59, 59, 999);

    const [daySum, weekSum, monthSum] = await Promise.all([
      this.prisma.inventory.aggregate({
        where: {
          shopId, // Filter by shop
          createdAt: {
            gte: startDateDay,
            lte: endDateDay,
          },
        },
        _sum: {
          cost: true,
        },
      }),
      this.prisma.inventory.aggregate({
        where: {
          shopId, // Filter by shop
          createdAt: {
            gte: startDateWeek,
            lte: endDateWeek,
          },
        },
        _sum: {
          cost: true,
        },
      }),
      this.prisma.inventory.aggregate({
        where: {
          shopId, // Filter by shop
          createdAt: {
            gte: startDateMonth,
            lte: endDateMonth,
          },
        },
        _sum: {
          cost: true,
        },
      }),
    ]);

    return {
      daySum: daySum._sum.cost || 0,
      weekSum: weekSum._sum.cost || 0,
      monthSum: monthSum._sum.cost || 0,
    };
  }

  async getRecentlySoldItems(shopId: number) {
    return this.prisma.inventory.findMany({
      where: {
        action: 'sell',
        shopId: shopId,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            quantity: true,
            category: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async getRecentlyRefilledItems(shopId: number) {
    return this.prisma.inventory.findMany({
      where: {
        action: 'refill',
        shopId: shopId,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            quantity: true,
            category: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async searchInventory(shopId: number, qitem: string, page: number = 1, perPage: number = 25) {
    const offset = (page - 1) * perPage;

    // First, find items matching the search term
    const items = await this.prisma.item.findMany({
      where: {
        name: {
          contains: qitem,
          mode: 'insensitive',
        },
        shopId: shopId,
      },
    });

    const itemIds = items.map((item) => item.id);

    if (itemIds.length === 0) {
      return {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        perPage: perPage,
        items: [],
      };
    }

    // Then find inventories for those items
    const [inventories, totalItems] = await Promise.all([
      this.prisma.inventory.findMany({
        where: {
          itemId: {
            in: itemIds,
          },
        },
        include: {
          item: true,
        },
        orderBy: { createdAt: 'desc' },
        take: perPage,
        skip: offset,
      }),
      this.prisma.inventory.count({
        where: {
          itemId: {
            in: itemIds,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      totalItems,
      totalPages,
      currentPage: page,
      perPage: perPage,
      items: inventories,
    };
  }

  async getInventoryByItemId(itemId: number) {
    const [inventories, totalCount] = await Promise.all([
      this.prisma.inventory.findMany({
        where: { itemId },
        include: {
          item: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.inventory.count({
        where: { itemId },
      }),
    ]);

    return {
      totalItems: totalCount,
      inventory: inventories,
    };
  }
}

