import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { EditUserDto } from 'src/user/dto';
import { CreateEventDto } from 'src/event/dto';
import { EditEventDto } from '../src/event/dto/edit-event.dto';
import { CreateTicketDto, EditTicketDto } from 'src/ticket/dto';
import { Event } from '@prisma/client';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });
  // Authentication e2e
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'guillaume.gascon@orange.fr',
      userName: 'GuillGN',
      password: 'Dwkwwlmh74930T'
    };
    // Register e2e
    describe('Register', () => {
      it('should throw if email empty', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            password: dto.password,
            userName: dto.userName
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: dto.email,
            userName: dto.userName
          })
          .expectStatus(400);
      });
      it('should throw if empty', () => {
        return pactum.spec()
          .post('/auth/login')
          .expectStatus(400);
      });
      it('should register', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    // Login e2e
    describe('Login', () => {
      it('should throw if email empty', () => {
        return pactum.spec()
          .post('/auth/login')
          .withBody({
            password: dto.password
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum.spec()
          .post('/auth/login')
          .withBody({
            email: dto.email
          })
          .expectStatus(400);
      });
      it('should throw if empty', () => {
        return pactum.spec()
          .post('/auth/login')
          .expectStatus(400);
      });
      it('should login', () => {
        return pactum.spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  // User e2e
  describe('User', () => {
    // Me e2e
    describe('Me', () => {
      it('should get myself', () => {
        return pactum.spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200);
      });
    });
    // Edit e2e
    describe('Edit', () => {
      it('should edit', () => {
        const dto: EditUserDto = {
          email: "guillaume.gascon@bluewin.ch",
          firstName: "Guillaume"
        };
        return pactum.spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });
  // Event e2e
  describe('Event', () => {
    // Get emtpy state
    describe('Get empty state', () => {
      it('should see empty state', () => {
        return pactum.spec()
          .get('/events')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    // Create e2e
    describe('Create', () => {
      it('should create event', () => {
        const dto: CreateEventDto = {
          title: "Halloween",
          creator: "Fabio",
          location: "Avenue du Lignon 30, 1219 Le Lignon",
          name: "Summer",
          date: new Date(),
          banner: 'banner image'
        }
        return pactum.spec()
          .post('/events')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('eventId', 'id');
      });
    });
    // Get e2e
    describe('Get', () => {
      it('should get event', () => {
        return pactum.spec()
          .get('/events')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    // Get by id e2e
    describe('Get by id', () => {
      it('should get event by id', () => {
        return pactum.spec()
          .get('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBodyContains('$S{eventId}');
      });
    });
    // Edit e2e
    describe('Edit', () => {
      it('should edit event', () => {
        const dto: EditEventDto = {
          title: 'Halloween 2k22 @ Lignon',
        }
        return pactum.spec()
          .patch('/events/edit/{id}')
          .withPathParams('id', '$S{eventId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
    // Delete e2e
    describe('Delete', () => {
      it('should delete event', () => {
        return pactum.spec()
          .delete('/events/delete/{id}')
          .withPathParams('id', '$S{eventId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(204);
      });
      it('should be empty', () => {
        return pactum.spec()
          .get('/events')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
  // Ticket e2e
  describe('Ticket', () => {
    // Get emtpy state
    describe('Get empty state', () => {
      it('should see empty state', () => {
        return pactum.spec()
          .get('/tickets')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    // Create e2e
    describe('Create', () => {
      it('should create ticket', () => {
        const dto: CreateTicketDto = {
          eventId: 1,
          barecode: 'https://your.image.here/',
          valid: true,
        }
        return pactum.spec()
          .post('/tickets')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('ticketId', 'id');
      });
    });
    // Get e2e
    describe('Get', () => {
      it('should get ticket', () => {
        return pactum.spec()
          .get('/tickets')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    // Get by id e2e
    describe('Get by id', () => {
      it('should get ticket by id', () => {
        return pactum.spec()
          .get('/tickets/{id}')
          .withPathParams('id', '$S{ticketId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBodyContains('$S{ticketId}');
      });
    });
    // Edit e2e
    describe('Edit', () => {
      it('should edit ticket', () => {
        const dto: EditTicketDto = {
          valid: false
        }
        return pactum.spec()
          .patch('/tickets/edit/{id}')
          .withPathParams('id', '$S{ticketId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
    // Delete e2e
    describe('Delete', () => {
      it('should delete ticket', () => {
        return pactum.spec()
          .delete('/tickets/delete/{id}')
          .withPathParams('id', '$S{ticketId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(204);
      });
      it('should be empty', () => {
        return pactum.spec()
          .get('/events')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});