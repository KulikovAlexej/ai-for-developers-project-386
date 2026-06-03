import { IsString, IsInt, IsPositive, IsOptional } from 'class-validator';

export class UpdateEventTypeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  duration?: number;
}
