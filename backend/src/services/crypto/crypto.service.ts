import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

export default class Cryptographer {
  private readonly logger = new Logger();
  public async createHash(plainText: string) {
    try {
      const salt = await bcrypt.genSalt();
      const hasdedPassWord = await bcrypt.hash(plainText, salt);
      return hasdedPassWord;
    } catch (error) {
      this.logger.error(error);
      return '';
    }
  }

  public async veriFyHash({ password , hash }: { password: string; hash: string }) {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }


}
