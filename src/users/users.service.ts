import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
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
    });
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByUid(uid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uid },
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
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(userData: any) {
    const newUser = await this.prisma.user.create({
      data: userData,
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
    });

    return newUser;
  }

  async updateUser(id: number, userData: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userData,
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
    });

    return updatedUser;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async acceptUser(userId: number, shopId: number) {
    const userShop = await this.prisma.userShop.findUnique({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
    });

    if (!userShop) {
      throw new NotFoundException('User is not associated with this shop');
    }

    const updatedUserShop = await this.prisma.userShop.update({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
      data: { acceptedIntoShop: true },
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

    return {
      ...updatedUserShop.user,
      shopId: updatedUserShop.shopId,
      acceptedIntoShop: updatedUserShop.acceptedIntoShop,
      permission: updatedUserShop.permission || updatedUserShop.user.permission,
    };
  }

  async deacceptUser(userId: number, shopId: number) {
    const userShop = await this.prisma.userShop.findUnique({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
    });

    if (!userShop) {
      throw new NotFoundException('User is not associated with this shop');
    }

    const updatedUserShop = await this.prisma.userShop.update({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
      data: { acceptedIntoShop: false },
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

    return {
      ...updatedUserShop.user,
      shopId: updatedUserShop.shopId,
      acceptedIntoShop: updatedUserShop.acceptedIntoShop,
      permission: updatedUserShop.permission || updatedUserShop.user.permission,
    };
  }
}

