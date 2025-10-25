import { Injectable, Logger } from '@nestjs/common';
import DatabaseService from '../database/database.service';
import Cryptographer from '../crypto/crypto.service';

@Injectable()
export default class AdmminStartUpService {
  private readonly database = new DatabaseService();
  private readonly logger = new Logger('AdminStartUpService');
  private readonly hasService = new Cryptographer();
  public async createDefaultAdmin() {
    try {
      const existAdmin = await this.database.users.findFirst({
        where: {
          role: 'ADMIN',
        },
      });
      if (!existAdmin) {
        this.logger.log('Creating default Admin');
        const hasdedPassword = await this.hasService.createHash(
          (process.env.ADMINPASS as string) ?? '1234567890',
        );
        const admin = {
          name: 'Culonga',
          lastname: 'Culonga',
          telefone: '+244955555500',
          profile: 'https://github.com/shadcn.png',
          email: process.env.ADMINEMAIL ?? 'admin@admin.ao',
          password: hasdedPassword,
        };
        const created = await this.database.users.create({
          data: {
            ...admin,
            role: 'ADMIN',
            status: 'APROVED',
          },
        });
        if (created && created?.id) {
          this.logger.log('Admin created');
        } else {
          this.logger.log('Error while creating admin');
        }
        return;
      }
      this.logger.log('Admin already exist');
      return true;
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? 'Error while Inserting default admin',
      );
    }
  }
}
