import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectShopDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  shopId: number;
}

