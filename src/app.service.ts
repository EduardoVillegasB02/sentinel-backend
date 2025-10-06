import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInitial(): any {
    return {
      message: 'Welcome to Sentinel Server',
      success: true,
    };
  }
}
