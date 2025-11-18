import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { EvidenceService } from './evidence.service';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get('*path')
  getFile(@Param('path') path: string[] | string, @Res() res: Response) {
    const filePath = this.evidenceService.getFile(path);
    return res.sendFile(filePath);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.evidenceService.delete(id);
  }
}
