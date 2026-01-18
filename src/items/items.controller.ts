import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, UseInterceptors, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopFilterInterceptor } from '../common/interceptors/shop-filter.interceptor';
import { ShopOwnershipGuard } from '../common/guards/shop-ownership.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('items')
@Controller('items')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ShopFilterInterceptor)
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all items with pagination (filtered by shop, requires shopId query param)' })
  @ApiResponse({ status: 200, description: 'List of items' })
  async getAllItems(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('shopId') shopId?: string,
  ) {
    if (!shopId) {
      throw new ForbiddenException('shopId query parameter is required');
    }
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 10;
    return this.itemsService.getAllItems(+shopId, pageNum, perPageNum);
  }

  @Get('search/search')
  @ApiOperation({ summary: 'Search items by keyword (filtered by shop, requires shopId query param)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchItem(
    @Query('keyword') keyword: string,
    @Query('shopId') shopId?: string,
  ) {
    if (!shopId) {
      throw new ForbiddenException('shopId query parameter is required');
    }
    return this.itemsService.searchItem(keyword, +shopId);
  }

  @Get('op/below-optimum/shops/:shopId')
  @ApiOperation({ summary: 'Get items below refill limit for a shop' })
  @ApiResponse({ status: 200, description: 'List of items below refill limit' })
  async getItemsBelowRefillLimit(
    @Param('shopId') shopId: string,
  ) {
    return this.itemsService.getItemsBelowRefillLimit(+shopId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Item found' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @UseGuards(ShopOwnershipGuard)
  async getOneItem(@Param('id') id: string) {
    return this.itemsService.getOneItem(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new item (requires shopId in request body)' })
  @ApiResponse({ status: 201, description: 'Item created' })
  async addItem(@Body() itemData: any) {
    if (!itemData.shopId) {
      throw new ForbiddenException('shopId is required in request body');
    }
    return this.itemsService.addItem(itemData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update item by ID' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @UseGuards(ShopOwnershipGuard)
  async updateItem(@Param('id') id: string, @Body() itemData: any) {
    return this.itemsService.updateItem(+id, itemData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete item by ID' })
  @ApiResponse({ status: 204, description: 'Item deleted' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @UseGuards(ShopOwnershipGuard)
  async deleteItem(@Param('id') id: string) {
    await this.itemsService.deleteItem(+id);
  }
}

