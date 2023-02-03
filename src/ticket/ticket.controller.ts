import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Ticket, User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { CreateTicketDto, EditTicketDto } from './dto';
import { TicketService } from './ticket.service';

@UseGuards(JwtGuard)
@Controller('tickets')
export class TicketController {
  
  constructor(
    private ticketService: TicketService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createTicket(@GetUser() user: User, @Body() dto: CreateTicketDto): Promise<Ticket> {
    return await this.ticketService.createTicket(user.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getTickets(@GetUser() user: User): Promise<Ticket[]> {
    return await this.ticketService.getTickets(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getTicketById(@GetUser() user: User, @Param('id', ParseIntPipe) ticketId: number): Promise<Ticket> {
    return await this.ticketService.getTicketById(user.id, ticketId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('edit/:id')
  async editTicket(@GetUser() user: User, @Body() dto: EditTicketDto, @Param('id', ParseIntPipe) ticketId: number): Promise<Ticket> {
    return await this.ticketService.editTicket(user.id, dto, ticketId)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('delete/:id')
  async deleteTicket(@GetUser() user: User, @Param('id', ParseIntPipe) ticketId: number): Promise<void> {
    return await this.ticketService.deleteTicket(user.id, ticketId);
  }

}
