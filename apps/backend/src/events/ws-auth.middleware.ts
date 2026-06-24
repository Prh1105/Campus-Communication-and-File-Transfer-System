import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

export type AuthenticatedSocket = Socket & {
  data: {
    user: { id: number; username: string };
  };
};

export function createWsAuthMiddleware(jwtService: JwtService) {
  return (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('未提供认证令牌'));
      }

      const payload = jwtService.verify(token);
      socket.data.user = { id: payload.sub, username: payload.username };
      next();
    } catch {
      next(new Error('无效的认证令牌'));
    }
  };
}
