import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';

@ApiTags('shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all shops' })
  @ApiResponse({ status: 200, description: 'List of all shops' })
  async getAllShops() {
    return this.shopsService.getAllShops();
  }

  @Get('verify/:name')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Verify shop by name' })
  @ApiResponse({ status: 200, description: 'Shop verification result' })
  async verifyShopByName(@Param('name') name: string) {
    return this.shopsService.verifyShopByName(name);
  }

  @Get('me/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s shop (uses shopId from token, cookies, or query param)' })
  @ApiResponse({ status: 200, description: 'Shop found' })
  @ApiResponse({ status: 404, description: 'Shop not found or user not associated with shop' })
  async getCurrentUserShop(@CurrentUser() user: any, @Query('shopId') shopId?: string, @Req() req?: any) {
    // Get shopId from query, cookies, or token
    let finalShopId = shopId || req?.cookies?.shopId || user.shopId;
    
    if (!finalShopId) {
      throw new NotFoundException('shopId is required. Provide it as query parameter, in cookies, or user must be connected to a shop');
    }
    
    const shop = await this.shopsService.getShopById(+finalShopId);
    
    // Verify user belongs to this shop
    const userShops = await this.shopsService.getUserShops(user.id);
    const userShopIds = userShops.map(s => s.id);
    if (!userShopIds.includes(+finalShopId)) {
      throw new NotFoundException('User is not associated with this shop');
    }
    
    return shop;
  }

  @Get('me/shops')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shops belonging to the current user' })
  @ApiResponse({ status: 200, description: 'List of user\'s shops' })
  async getUserShops(@CurrentUser() user: any) {
    return this.shopsService.getUserShops(user.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get shop by ID' })
  @ApiResponse({ status: 200, description: 'Shop found' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getShopById(@Param('id') id: string) {
    return this.shopsService.getShopById(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shop and automatically connect the user to it' })
  @ApiResponse({ status: 201, description: 'Shop created and user connected' })
  async createShop(@Body() createShopDto: CreateShopDto, @CurrentUser() user: any) {
    return this.shopsService.createShop(createShopDto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shop by ID' })
  @ApiResponse({ status: 200, description: 'Shop updated' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async updateShop(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.updateShop(+id, updateShopDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shop by ID' })
  @ApiResponse({ status: 204, description: 'Shop deleted' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async deleteShop(@Param('id') id: string) {
    await this.shopsService.deleteShop(+id);
  }

  @Get(':shopId/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users belonging to a shop' })
  @ApiResponse({ status: 200, description: 'List of shop users' })
  async getShopUsers(@Param('shopId') shopId: string) {
    return this.shopsService.getShopUsers(+shopId);
  }

  @Get(':shopId/users/accepted/yes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get accepted users belonging to a shop' })
  @ApiResponse({ status: 200, description: 'List of accepted shop users' })
  async getShopAcceptedUsers(@Param('shopId') shopId: string) {
    return this.shopsService.getShopAcceptedUsers(+shopId);
  }

  @Get(':shopId/users/accepted/no')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unaccepted users belonging to a shop' })
  @ApiResponse({ status: 200, description: 'List of unaccepted shop users' })
  async getShopUnacceptedUsers(@Param('shopId') shopId: string) {
    return this.shopsService.getShopUnacceptedUsers(+shopId);
  }
}

