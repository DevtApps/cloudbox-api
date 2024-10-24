import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Role } from 'src/enum/policy/role';


export  class Session {
  uid: string
  role: Role

}

export const getCurrentSessionByContext = (context: ExecutionContext): Session => {
  var session:Session;
  if (context.getType() === 'http') {
    session = context.switchToHttp().getRequest().session;
  }
  if (context.getType() === 'rpc') {
    session = context.switchToRpc().getData().session;
  }


  return session;
};

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentSessionByContext(context),
);