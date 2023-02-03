import { ForbiddenException, Injectable } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { error } from 'src/auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, EditTicketDto } from './dto';

@Injectable()
export class TicketService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async createTicket(userId: number, dto: CreateTicketDto): Promise<Ticket> {
    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        ...dto
      },
    });
    return ticket;
  }

  async getTickets(userId: number): Promise<Ticket[]> {
    return await this.prisma.ticket.findMany({
      where: {
        userId
      },
    });
  }

  async getTicketById(userId: number, ticketId: number): Promise<Ticket> {
    return await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        userId
      },
    });
  }

  async editTicket(userId: number, dto: any, ticketId: number): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: {
        id: ticketId
      },
    });
    if (!ticket || ticket.userId !== userId) {
      throw new ForbiddenException(
        {
          message: 'Access to resources denied',
          translation: 'error.access',
          code: error.ACCESS_DENIED
        }
      );
    }
    return this.prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        ...dto
      },
    });
  }

  async deleteTicket(userId: number, ticketId: number): Promise<void> {
    const ticket = await this.prisma.ticket.findUnique({
      where: {
        id: ticketId
      },
    });
    if (!ticket || ticket.userId !== userId) {
      throw new ForbiddenException(
        {
          message: 'Access to resources denied',
          translation: 'error.access',
          code: error.ACCESS_DENIED
        }
      );
    }
    await this.prisma.ticket.delete({
      where: {
        id: ticketId
      }
    });
  }

}
