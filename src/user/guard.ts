import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (!ctx.headers.authorization) {
      return false;
    }
    ctx.user = await this.validateToken(ctx.headers.authorization);
    return true;
  }

  async validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const token = auth.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_TOKEN_KEY) as any;
      return decoded;
    } catch (err) {
      const message = 'Token error: ' + (err.message || err.name);
      if (err.name === 'TokenExpiredError') {
        throw new HttpException(
          'Your Session  has Been expired',
          HttpStatus.UNAUTHORIZED
        );
      }

      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }
}
