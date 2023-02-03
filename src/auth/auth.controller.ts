import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { AuthDto } from './dto/auth.dto';
import { JwtGuard, RefreshTokenGuard } from './guards';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: AuthDto): Promise<Tokens> {
    return await this.authService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verification-code')
  async sendEmailValidationCode(@Body() body: any): Promise<void> {
    return await this.authService.sendEmailValidationCode(body.email, body.code);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() dto: AuthDto): Promise<Tokens> {
    return await this.authService.register(dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@GetUser() user: User) {
    return await this.authService.logout(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Body() body: any) {
    return await this.authService.refreshToken(body.id, body.refreshToken);
  }
  
}
