import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';

@ApiTags('inventories')
@Controller('inventories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('shops/:shopId')
  @ApiOperation({ summary: 'Get all inventory by shop with pagination' })
  @ApiResponse({ status: 200, description: 'List of inventory items' })
  async getAllInventoryByShop(
    @Param('shopId') shopId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 25;
    return this.inventoryService.getAllInventoryByShop(+shopId, pageNum, perPageNum);
  }

  @Get('general-sums')
  @ApiOperation({ summary: 'Get inventory general sums (day, week, month) filtered by shop (uses shopId from token, query, body, or cookies)' })
  @ApiResponse({ status: 200, description: 'General sums' })
  async getInventoryGeneralSums(@CurrentUser() user?: any, @Query('shopId') shopId?: string, @Req() req?: any) {
    // Get shopId from token, query, body, or cookies (handled by interceptor if used)
    const finalShopId = shopId || user?.shopId || req?.cookies?.shopId || (req as any)?.shopId;
    if (!finalShopId) {
      throw new ForbiddenException('shopId is required');
    }
    return this.inventoryService.getInventoryGeneralSums(+finalShopId);
  }

  @Get('recently-sold/shops/:shopId')
  @ApiOperation({ summary: 'Get recently sold items' })
  @ApiResponse({ status: 200, description: 'List of recently sold items' })
  async getRecentlySoldItems(@Param('shopId') shopId: string) {
    return this.inventoryService.getRecentlySoldItems(+shopId);
  }

  @Get('recently-refilled/shops/:shopId')
  @ApiOperation({ summary: 'Get recently refilled items' })
  @ApiResponse({ status: 200, description: 'List of recently refilled items' })
  async getRecentlyRefilledItems(@Param('shopId') shopId: string) {
    return this.inventoryService.getRecentlyRefilledItems(+shopId);
  }

  @Get('search/shops/:shopId')
  @ApiOperation({ summary: 'Search inventory by item name' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchInventory(
    @Param('shopId') shopId: string,
    @Query('qitem') qitem: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 25;
    return this.inventoryService.searchInventory(+shopId, qitem, pageNum, perPageNum);
  }

  @Get('by-item-id/:itemId')
  @ApiOperation({ summary: 'Get inventory by item ID' })
  @ApiResponse({ status: 200, description: 'Inventory items for the item' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async getInventoryByItemId(@Param('itemId') itemId: string) {
    return this.inventoryService.getInventoryByItemId(+itemId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new inventory record' })
  @ApiResponse({ status: 201, description: 'Inventory created' })
  async addInventory(@Body() inventoryData: any) {
    return this.inventoryService.addInventory(inventoryData);
  }

  @Post('sell')
  @ApiOperation({ summary: 'Create a sell inventory record' })
  @ApiResponse({ status: 201, description: 'Sell inventory created' })
  async addSellInventory(@Body() inventoryData: any) {
    return this.inventoryService.addInventory(inventoryData);
  }

  @Post('refill')
  @ApiOperation({ summary: 'Create a refill inventory record' })
  @ApiResponse({ status: 201, description: 'Refill inventory created' })
  async addRefillInventory(@Body() inventoryData: any) {
    return this.inventoryService.addInventory(inventoryData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory by ID' })
  @ApiResponse({ status: 200, description: 'Inventory updated' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async updateInventory(@Param('id') id: string, @Body() inventoryData: any) {
    return this.inventoryService.updateInventory(+id, inventoryData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory by ID' })
  @ApiResponse({ status: 204, description: 'Inventory deleted' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async deleteInventory(@Param('id') id: string) {
    await this.inventoryService.deleteInventory(+id);
  }
}

