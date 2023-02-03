import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Image } from '@prisma/client';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {

  constructor(
    private imageService: ImageService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getImages(@Req() req: any): Promise<Image[]> {
    const images = await this.imageService.getImages();
    const host = req.get('host');
    images.forEach(image => {
      image.url = `http://${host}/image/${image.id}`;
    });
    return images;
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getImageById(@Param('id', ParseIntPipe) imageId: number, @Res() res: any): Promise<any> {
    const image = await this.imageService.getImageById(imageId);
    if (!image) throw new NotFoundException('Image not found !');
    const b64 = Buffer.from(image.data.buffer).toString('base64');
    res.setHeader('Content-Type', image.contentType);
    return res.send({
      contentType: image.contentType,
      b64: b64
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: any,
    @Req() req: any, 
    @Body() body: any): Promise<Image> {
    const image = await this.imageService.createImage(file, body);
    const host = req.get('host');
    image.url = `https://${host}/image/${image.id}`;
    return res.send(image);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('delete/:id')
  async deleteEvent(@Param('id', ParseIntPipe) eventId: number): Promise<void> {
  }
  
}
