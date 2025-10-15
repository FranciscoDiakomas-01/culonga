import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { JwtPayload } from './jwt.payload';
import { Logger } from '@nestjs/common';

config();
export default class JWTService {
  private readonly SECRET = process.env.JWT_SECRET ?? '1234567890';
  private readonly logger = new Logger('JWT SERVICE');

  public sign(payload: JwtPayload) {
    const createdAt = new Date();
    const expireAt = new Date();
    expireAt.setDate(createdAt.getDate() + 30);
    try {
      payload = {
        ...payload,
        createdAt,
        expireAt,
      };
      const token = jwt.sign(payload, this.SECRET);
      return token;
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao gerar o token');
      return '';
    }
  }
  public verify(token: string) {
    try {
      const isVeried = jwt.verify(token, this.SECRET) as JwtPayload;
      return isVeried?.userid ? true : false;
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao validar o token');
      return false;
    }
  }
  public decode(token: string) {
    try {
      const isDecoded = jwt.decode(token) as JwtPayload;
      return isDecoded?.userid ? isDecoded : ({} as JwtPayload);
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao decodificar o token');
      return {} as JwtPayload;
    }
  }
  public signRecoveryRequest(userid : string) {
    try {
      const token = jwt.sign({ userid }, this.SECRET, {
        expiresIn: '1h',
      });
      return token;
    } catch (error) {
      this.logger.log(error?.message ?? 'Erro ao gerar o token');
      return '';
    }
  }
}
