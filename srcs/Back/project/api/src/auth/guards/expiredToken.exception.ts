import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpiredToken extends HttpException {
  data: any;
    constructor(message: string, data: any) {
      super(message, HttpStatus.UNAUTHORIZED);
      this.data = data;
    }

    getData(){
      return this.data;
    }
  }