import { Injectable } from '@nestjs/common';
import { Image } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class ImageService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async getImages(): Promise<Image[]> {
    const images = await this.prisma.image.findMany();
    return images;
  }

  async getImageById(imageId: number): Promise<Image> {
    return await this.prisma.image.findFirst({
      where: {
        id: imageId,
      }
    });
  }

  async createImage(file: any, dto: CreateCatDto): Promise<Image> {
    const image = await this.prisma.image.create({
      data: {
        ...dto,
        contentType: file.mimetype,
        data: file.buffer,
        name: dto.name
      }
    });
    return image;
  }

}
