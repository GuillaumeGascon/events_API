import { MailerService } from '@nestjs-modules/mailer';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

export enum error {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  BAD_CREDENTIAL = 'BAD_CREDENTIAL',
  EMAIL_ALREADY_EXIST = 'EMAIL_ALREADY_EXIST',
  USERNAME_ALREADY_EXIST = 'USERNAME_ALREADY_EXIST',
  ACCESS_DENIED = 'ACCESS_DENIED',
  BAD_REFRESH_TOKEN = 'BAD_REFRESH_TOKEN',
  ERROR_DEFAULT = 'ERROR_DEFAULT'
}

@Injectable()
export class AuthService {

  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  //Login
  async login(dto: AuthDto): Promise<any> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // If user doas not exist, throw exception
    if (!user) throw new ForbiddenException(
      {
        message: 'User not found',
        translation: 'error.userNotFound',
        code: error.USER_NOT_FOUND
      }
    );
    // Compare password
    const pwMatches = await argon.verify(user.hash, dto.hash);
    // If password doesn't match, throw error
    if (!pwMatches) throw new ForbiddenException(
      {
        message: 'Credentials incorrect',
        translation: 'error.credential',
        code: error.BAD_CREDENTIAL
      }
    );
    return this.generateTokens(user.id, user.email);
  }

  // Register
  async register(dto: AuthDto): Promise<Tokens> {
    try {
      const avatarId = Math.random() * (6 - 1) + 1;
      // Generate password hash
      const hash = await argon.hash(dto.hash);
      // Save the user to the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          userName: dto.userName,
          hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          avatar: avatarId.toString(),
          role: 'USER'
        },
      });
      return this.generateTokens(user.id, user.email);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        const code = err.meta.target[0];
        switch (code) {
          case 'email':
            throw new ForbiddenException(
              {
                message: 'Email already taken',
                translation: 'error.emailAlreadyUsed',
                code: error.USER_NOT_FOUND
              }
            );
          case 'userName':
            throw new ForbiddenException(
              {
                message: 'Username already taken',
                translation: 'error.usernameAlreadyUsed',
                code: error.USER_NOT_FOUND
              }
            );
          default:
            throw new ForbiddenException(
              {
                message: 'Unknow error',
                translation: 'error.unknow',
                code: error.ERROR_DEFAULT
              }
            );
        }
      }
    }
  }
  
  async logout(userId: number): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        salt: {
          not: null,
        },
      },
      data: {
        salt: null,
      }
    });
  }

  // Token related methods

  async generateToken(userId: number, email: string, expiration: string): Promise<string> {
    const payload = {
      sub: userId,
      email
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: expiration,
        secret: secret,
      }
    );
    return token;
  }

  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const salt = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        salt: salt,
      },
    });
  }

  async generateTokens(userId: number, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      await this.generateToken(userId, email, '15m'),
      await this.generateToken(userId, email, '7d')
    ]);
    const tokens: Tokens = {
      access_token: accessToken,
      refresh_token: refreshToken
    }
    await this.saveRefreshToken(userId, refreshToken);
    return tokens;
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new ForbiddenException(
      {
        message: 'User not found',
        translation: 'error.userNotFound',
        code: error.USER_NOT_FOUND
      }
    );
    const compareRefreshToken = await argon.verify(user.salt, refreshToken);
    if (!compareRefreshToken) throw new ForbiddenException(
      {
        message: 'Refresh token doesn\'t match with the server',
        translation: 'error.badRefreshToken',
        code: error.BAD_REFRESH_TOKEN
      }
    );
    return await this.generateTokens(user.id, user.email);
  }

  async sendEmailValidationCode(email: string, code: string): Promise<void> {
    try {
      await this.mailer.sendMail({
        to: email,
        from: 'info@guillaumegascon.eu',
        subject: 'Your validation code !',
        template: 'verification-code',
        context: {
          code: code
        }
      });
    } catch (err) {
      console.error(err);
      throw new ForbiddenException(
        {
          message: 'Unknow error',
          translation: 'error.unknow',
          code: error.ERROR_DEFAULT
        }
      )
    }
  }

}
