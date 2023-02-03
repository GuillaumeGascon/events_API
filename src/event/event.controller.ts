import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Event, Image } from '@prisma/client';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateEventDto, EditEventDto } from './dto';
import { EventService } from './event.service';

@UseGuards(JwtGuard)
@Controller('events')
export class EventController {

  constructor(
    private eventService: EventService
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createEvent(@Body() dto: CreateEventDto): Promise<Event> {
    return await this.eventService.createEvent(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getEvents(): Promise<Event[]> {
    return await this.eventService.getEvents();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getEventById(@Param('id', ParseIntPipe) eventId: number): Promise<Event> {
    return await this.eventService.getEventById(eventId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('edit/:id')
  async editEvent(@Body() dto: EditEventDto, @Param('id', ParseIntPipe) eventId: number): Promise<Event> {
    return await this.eventService.editEvent(dto, eventId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('delete/:id')
  async deleteEvent(@Param('id', ParseIntPipe) eventId: number): Promise<void> {
    return await this.eventService.deleteEvent(eventId);
  }
  
}
