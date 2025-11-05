import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const allowedOrigins = [
      'https://app.culonga.com',
      'https://culonga.com',
      'http://localhost:3000',
    ];

    const origin = req?.headers?.origin as any;

    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, token, x-api-key',
    );
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  }
}
