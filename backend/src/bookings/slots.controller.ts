import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { Slot } from '../core/models/slot';

@Controller('event-types/:eventTypeId/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  async getAvailableSlots(
    @Param('eventTypeId', ParseUUIDPipe) eventTypeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<Slot[]> {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException(
        'from and to must be valid ISO date strings',
      );
    }

    return this.slotsService.getAvailableSlots(eventTypeId, fromDate, toDate);
  }
}
