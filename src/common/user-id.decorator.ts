import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      if (data === 'optional') {
        return null;
      }
      throw new UnauthorizedException('JWT token not provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('JWT token not provided');
    }

    const decoded: any = jwt.decode(token);

    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException('Invalid JWT token');
    }

    return decoded.sub;
  },
);
