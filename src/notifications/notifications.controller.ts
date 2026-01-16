import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  async createNotification(@Body() notificationData: any) {
    return this.notificationsService.createNotification(notificationData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'List of all notifications' })
  async getAllNotifications() {
    return this.notificationsService.getAllNotifications();
  }

  @Get('unread-count/:shopId')
  @ApiOperation({ summary: 'Get unread notifications count for a shop' })
  @ApiResponse({ status: 200, description: 'Unread notifications count' })
  async getUnreadNotificationsCount(@Param('shopId') shopId: string) {
    return this.notificationsService.getUnreadNotificationsCount(+shopId);
  }

  @Post(':id/mark-as-read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markNotificationAsRead(@Param('id') id: string) {
    return this.notificationsService.markNotificationAsRead(+id);
  }

  @Post('mark-all-as-read/:shopId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read for a shop' })
  @ApiResponse({ status: 204, description: 'All notifications marked as read' })
  async markAllNotificationsAsRead(@Param('shopId') shopId: string) {
    await this.notificationsService.markAllNotificationsAsRead(+shopId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification updated' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async updateNotification(@Param('id') id: string, @Body() notificationData: any) {
    return this.notificationsService.updateNotification(+id, notificationData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification by ID' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(@Param('id') id: string) {
    await this.notificationsService.deleteNotification(+id);
  }

  @Get('shops/:shopId')
  @ApiOperation({ summary: 'Get all notifications for a shop' })
  @ApiResponse({ status: 200, description: 'List of shop notifications' })
  async getShopNotifications(@Param('shopId') shopId: string) {
    return this.notificationsService.getShopNotifications(+shopId);
  }
}

