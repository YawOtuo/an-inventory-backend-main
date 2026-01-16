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
        shopId: true,
        acceptedIntoShop: true,
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
        shopId: true,
        acceptedIntoShop: true,
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
        shopId: true,
        acceptedIntoShop: true,
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
    const data = {
      ...userData,
      acceptedIntoShop: false,
    };

    const newUser = await this.prisma.user.create({
      data,
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
        shopId: true,
        acceptedIntoShop: true,
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

  async acceptUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { acceptedIntoShop: true },
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

    return updatedUser;
  }

  async deacceptUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { acceptedIntoShop: false },
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

    return updatedUser;
  }
}

