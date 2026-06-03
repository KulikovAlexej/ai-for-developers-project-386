import { IsString, IsInt, IsPositive } from 'class-validator';

export class CreateEventTypeDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsInt()
  @IsPositive()
  duration!: number;
}
