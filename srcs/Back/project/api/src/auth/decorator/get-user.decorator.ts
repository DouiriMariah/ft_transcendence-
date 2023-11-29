import { createParamDecorator, ExecutionContext, StreamableFile } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request : Express.Request = ctx
    .switchToHttp()
    .getRequest();
    if(data){ //we do this if we want to return the data not the full object
      return request.user[data];//ATTENTION
    }
    return request.user;//ATTENTION
  },
);

/* ctx is the context of the request, you can switch with sockets or http etc */