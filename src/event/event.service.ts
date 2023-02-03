import { ForbiddenException, Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { error } from 'src/auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, EditEventDto } from './dto';

@Injectable()
export class EventService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async createEvent(dto: CreateEventDto): Promise<Event> {
    const event = await this.prisma.event.create({
      data: {
        ...dto
      }
    });
    return event;
  }

  async getEvents(): Promise<Event[]> {
    return await this.prisma.event.findMany();
  }

  async getEventById(eventId: number): Promise<Event> {
    return await this.prisma.event.findFirst({
      where: {
        id: eventId,
      }
    });
  }

  async editEvent(dto: EditEventDto, eventId: number): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
    if (!event) {
      throw new ForbiddenException(
        {
          message: 'Access to resources denied',
          translation: 'error.access',
          code: error.ACCESS_DENIED
        }
      );
    }
    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        ...dto
      },
    });
  }
  
  async deleteEvent(eventId: number): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
    if (!event) {
      throw new ForbiddenException(
        {
          message: 'Access to resources denied',
          translation: 'error.access',
          code: error.ACCESS_DENIED
        }
      );
    }
    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });
  }

}
