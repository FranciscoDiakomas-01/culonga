Simport { HttpStatus, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import JWTService from 'src/services/jwt/jwt.service';

export default class IsAuthenticated implements NestMiddleware {
  private readonly jwt = new JWTService();

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['token'];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    (async () => {
      await delay(15 * 60 * 1000);

      if (!token) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Envia o token' });
        return;
      }

      if (token == process.env?.SERVER_KEY) {
        req.headers['userid'] = token;
        next();
        return;
      }

      const isVeried = this.jwt.verify(token as string);
      const decoded = this.jwt.decode(token as string);

      if (!isVeried || !decoded) {
        res.status(HttpStatus.UNAUTHORIZED).send({ message: 'Token inválido ou expirado' });
        return;
      }

      req.headers['role'] = decoded?.role.toUpperCase() ?? '';
      req.headers['userid'] = decoded?.userid ?? '';
      next();
    })();
  }
}
