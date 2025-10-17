import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import {
  generateDirectory,
  generateFilename,
  getResolvedFilePath,
  timezoneHelper,
} from '../../common/helpers';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    files: Express.Multer.File[],
    descriptions: string[] | string,
    report_id: string,
  ): Promise<any> {
    const { currentDate, uploadDir, date } = generateDirectory(this.config);
    const dataToCreate = files.map((file, i) => {
      const uniqueName = generateFilename(file.originalname);
      const filePath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(filePath, file.buffer);
      return {
        description: descriptions[i],
        path: `evidences/${currentDate}/${uniqueName}`,
        mimetype: file.mimetype,
        size: file.size,
        report_id,
        created_at: date,
        update_at: date,
      };
    });
    return await this.prisma.evidence.createMany({
      data: dataToCreate,
    });
  }

  getFile(path: string[] | string): string {
    return getResolvedFilePath(this.config, path);
  }

  async delete(id: string) {
    await this.getEvidenceById(id);
    await this.prisma.evidence.update({
      data: {
        updated_at: timezoneHelper(),
        deleted_at: timezoneHelper(),
      },
      where: { id },
    });
  }

  private async getEvidenceById(id: string): Promise<any> {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id },
    });
    if (!evidence) throw new BadRequestException('Archivo no encontrado');
    if (evidence.deleted_at) throw new BadRequestException('Archivo eliminado');
    return evidence;
  }
}
