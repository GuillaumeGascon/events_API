import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

const imageFilter = function (req, file, cb) {
  // accept image only
  if (!file.originalname.match(/.(jpg|jpeg.webp)$/)) {
    cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
  }
  cb(null, true);
};

@Module({
  controllers: [ImageController],
  providers: [ImageService],
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        fileFilter: imageFilter
      }),
    }),
  ]
})
export class ImageModule {}
