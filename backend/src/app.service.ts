import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'success',
      message: 'Femcare Backend API is running successfully',
      version: '1.0.2'
    };
  }
}
