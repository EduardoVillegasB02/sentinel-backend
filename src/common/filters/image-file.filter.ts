import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: any, acceptFile: boolean) => void,
) {
  if (!file.mimetype?.startsWith('image/'))
    return cb(new BadRequestException('Solo se permiten imágenes'), false);
  cb(null, true);
}
