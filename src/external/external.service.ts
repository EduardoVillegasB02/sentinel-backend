import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalService {
  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  async getExternalUser(dni: string): Promise<any> {
    try {
      const key = this.config.get<string>('EXTERNAL_KEY');
      const route = this.config.get<string>('EXTERNAL_ROUTE');
      if (!key || !route)
        throw new InternalServerErrorException(
          'Varibles internas no definidas',
        );
      const { data } = await firstValueFrom(
        this.http.get(`${route}/${dni}`, {
          headers: {
            'x-api-key': key,
          },
        }),
      );
      return data.data;
    } catch (error) {
      throw error;
    }
  }
}
