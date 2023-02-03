import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { extname } from 'path';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
