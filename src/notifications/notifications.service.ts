import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(notificationData: any) {
    return this.prisma.notification.create({
      data: {
        ...notificationData,
        read: false,
      },
    });
  }

  async getAllNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateNotification(id: number, notificationData: any) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: notificationData,
    });
  }

  async deleteNotification(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async getShopNotifications(shopId: number) {
    return this.prisma.notification.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markNotificationAsRead(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllNotificationsAsRead(shopId: number) {
    await this.prisma.notification.updateMany({
      where: { shopId },
      data: { read: true },
    });
  }

  async getUnreadNotificationsCount(shopId: number) {
    const count = await this.prisma.notification.count({
      where: {
        shopId,
        read: false,
      },
    });

    return { count };
  }
}

