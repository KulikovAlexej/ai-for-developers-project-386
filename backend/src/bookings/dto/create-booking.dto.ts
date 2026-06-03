import { IsUUID, IsString, IsEmail, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  eventTypeId!: string;

  @IsString()
  guestName!: string;

  @IsEmail()
  guestEmail!: string;

  @IsDateString()
  startTime!: string;
}
