import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  @Get(':id/accept')
  @ApiOperation({ summary: 'Accept user into shop' })
  @ApiResponse({ status: 200, description: 'User accepted' })
  async acceptUser(@Param('id') id: string) {
    return this.usersService.acceptUser(+id);
  }

  @Get(':id/de-accept')
  @ApiOperation({ summary: 'De-accept user from shop' })
  @ApiResponse({ status: 200, description: 'User de-accepted' })
  async deacceptUser(@Param('id') id: string) {
    return this.usersService.deacceptUser(+id);
  }

  @Get('getUserByUid/:uid')
  @ApiOperation({ summary: 'Get user by UID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByUid(@Param('uid') uid: string) {
    return this.usersService.getUserByUid(uid);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async createUser(@Body() userData: any) {
    return this.usersService.createUser(userData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() userData: any) {
    return this.usersService.updateUser(+id, userData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(+id);
  }
}

