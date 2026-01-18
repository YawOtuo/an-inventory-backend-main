import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtUtil } from '../common/utils/jwt.util';
import { PasswordUtil } from '../common/utils/password.util';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConnectShopDto } from './dto/connect-shop.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordUtil: PasswordUtil,
    private jwtUtil: JwtUtil,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password, phoneNumber } = registerDto;

    // Check if user already exists by email only
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordUtil.hashPassword(password);

    // Create user
    const newUser = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
      },
    });

    // Get user's first shop (if any)
    const firstUserShop = await this.prisma.userShop.findFirst({
      where: { userId: newUser.id },
      orderBy: { createdAt: 'asc' },
    });

    // Generate tokens
    const userData = {
      id: newUser.id,
      email: newUser.email,
      shopId: firstUserShop?.shopId || null,
    };

    const accessToken = this.jwtUtil.generateAccessToken(userData);
    const refreshToken = this.jwtUtil.generateRefreshToken(userData);

    // Return user data (without password) and tokens
    const { password: _, ...userResponse } = newUser;

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user has a password
    if (!user.password) {
      throw new UnauthorizedException('Please set a password for your account');
    }

    // Compare password
    const isPasswordValid = await this.passwordUtil.comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Get user's first shop (if any)
    const firstUserShop = await this.prisma.userShop.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    // Generate tokens
    const userData = {
      id: user.id,
      email: user.email,
      shopId: firstUserShop?.shopId || null,
    };

    const accessToken = this.jwtUtil.generateAccessToken(userData);
    const refreshToken = this.jwtUtil.generateRefreshToken(userData);

    // Return user data (without password) and tokens
    const { password: _, ...userResponse } = user;

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Verify refresh token
    const decoded = this.jwtUtil.verifyToken(refreshToken);

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Get user from database
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get user's first shop (if any) - use from token if available, otherwise fetch
    let shopId = decoded.shopId || null;
    if (!shopId) {
      const firstUserShop = await this.prisma.userShop.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
      shopId = firstUserShop?.shopId || null;
    }

    // Generate new access token
    const userData = {
      id: user.id,
      email: user.email,
      shopId: shopId,
    };

    const accessToken = this.jwtUtil.generateAccessToken(userData);

    return { accessToken };
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    if (!user.password) {
      throw new BadRequestException('No password set for this account');
    }

    const isPasswordValid = await this.passwordUtil.comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.passwordUtil.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async connectToShop(userId: number, connectShopDto: ConnectShopDto) {
    const { shopId } = connectShopDto;

    // Verify shop exists
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already connected to this shop
    const existingUserShop = await this.prisma.userShop.findUnique({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
    });

    if (existingUserShop) {
      // Return success if already connected
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: userId },
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

      // Generate new tokens with updated shopId
      const userData = {
        id: updatedUser.id,
        email: updatedUser.email,
        shopId: shopId,
      };

      const accessToken = this.jwtUtil.generateAccessToken(userData);
      const refreshToken = this.jwtUtil.generateRefreshToken(userData);

      return {
        message: 'User is already connected to this shop',
        user: {
          ...updatedUser,
          shopId: shopId,
        },
        accessToken,
        refreshToken,
      };
    }

    // Create UserShop relationship
    await this.prisma.userShop.create({
      data: {
        userId: userId,
        shopId: shopId,
        acceptedIntoShop: false, // Pending approval
      },
    });

    // Get updated user with shops
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
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

    // Generate new tokens with updated shopId
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      shopId: shopId,
    };

    const accessToken = this.jwtUtil.generateAccessToken(userData);
    const refreshToken = this.jwtUtil.generateRefreshToken(userData);

    return {
      message: 'Successfully connected to shop',
      user: {
        ...updatedUser,
        shopId: shopId,
      },
      accessToken,
      refreshToken,
    };
  }
}

