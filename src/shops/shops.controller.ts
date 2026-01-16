import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
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

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get shop by ID' })
  @ApiResponse({ status: 200, description: 'Shop found' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getShopById(@Param('id') id: string) {
    return this.shopsService.getShopById(+id);
  }

  @Get('verify/:name')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Verify shop by name' })
  @ApiResponse({ status: 200, description: 'Shop verification result' })
  async verifyShopByName(@Param('name') name: string) {
    return this.shopsService.verifyShopByName(name);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shop and automatically connect the user to it' })
  @ApiResponse({ status: 201, description: 'Shop created and user connected' })
  async createShop(@Body() createShopDto: CreateShopDto, @CurrentUser() user: any) {
    return this.shopsService.createShop(createShopDto, user.id);
  }

  @Get('me/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s shop' })
  @ApiResponse({ status: 200, description: 'Current user\'s shop' })
  @ApiResponse({ status: 404, description: 'User has no shop' })
  async getCurrentUserShop(@CurrentUser() user: any) {
    if (!user.shopId) {
      throw new NotFoundException('User is not associated with any shop');
    }
    return this.shopsService.getShopById(user.shopId);
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

