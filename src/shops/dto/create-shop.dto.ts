import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShopDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}




