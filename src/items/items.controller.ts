import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ShopOwnershipGuard } from '../common/guards/shop-ownership.guard';
import { ShopFilterInterceptor } from '../common/interceptors/shop-filter.interceptor';
import { ItemsService } from './items.service';

@ApiTags('items')
@Controller('items')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ShopFilterInterceptor)
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all items with pagination (filtered by shop - uses shopId from token, query, body, or cookies)' })
  @ApiResponse({ status: 200, description: 'List of items' })
  async getAllItems(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @CurrentUser() user?: any,
    @Req() req?: any,
  ) {
    // shopId is automatically set by ShopFilterInterceptor
    const shopId = (req as any).shopId;
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 10;
    return this.itemsService.getAllItems(shopId, pageNum, perPageNum);
  }

  @Get('search/search')
  @ApiOperation({ summary: 'Search items by keyword (filtered by shop - uses shopId from token, query, body, or cookies)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchItem(
    @Query('keyword') keyword: string,
    @Req() req?: any,
  ) {
    // shopId is automatically set by ShopFilterInterceptor
    const shopId = (req as any).shopId;
    return this.itemsService.searchItem(keyword, shopId);
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
  @ApiOperation({ summary: 'Create a new item (uses shopId from token, query, body, or cookies)' })
  @ApiResponse({ status: 201, description: 'Item created' })
  async addItem(@Body() itemData: any, @Req() req?: any) {
    // shopId is automatically set by ShopFilterInterceptor, use it if not in body
    const shopId = itemData.shopId || (req as any).shopId;
    return this.itemsService.addItem({ ...itemData, shopId });
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

