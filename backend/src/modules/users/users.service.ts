import JWTService from 'src/services/jwt/jwt.service';
import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  LoginDTO,
  Recovery,
  UpdatePasswordDTO,
  ToogleUserVerification,
  UpdatePassWordFromTokenDTO,
  VerifyUserDTO,
} from './dto/create-user.dto';
import DatabaseService from 'src/services/database/database.service';
import UserGetter from './UseCases/get';
import UserDeleter from './UseCases/delete';
import UserUpedater from './UseCases/update';
import UserSetter from './UseCases/create';
import UserVerifier from './UseCases/verify';
import { Status } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}
  private readonly JWTService = new JWTService();
  public async createVerification(data: VerifyUserDTO, id: string) {
    const veririer = new UserVerifier(this.database);
    const res = await veririer.verify(data, id);
    return res;
  }
  public async toogleUserVerification(data: ToogleUserVerification) {
    const veririer = new UserVerifier(this.database);
    const res = await veririer.toogleVerification(data);
    return res;
  }
  // SETTERS
  public async create(createUserDto: CreateUserDto) {
    const userCreater = new UserSetter(this.database);
    const user = await userCreater.SignIn(createUserDto);
    return user;
  }
  public async login(data: LoginDTO) {
    const userCreater = new UserSetter(this.database);
    const user = await userCreater.LogIn(data);
    return user;
  }
  // GETTERS
  public async getAllUsers(page: number = 1) {
    const getter = new UserGetter(this.database);
    const users = await getter.getAllUsers(page < 0 ? 1 : page);
    return users;
  }
  public async getAllUsersByStatus(page: number = 1, status: Status) {
    const getter = new UserGetter(this.database);
    const users = await getter.getAllUsersByStatus(page < 0 ? 1 : page, status);
    return users;
  }
  public async getUserById(id: string) {
    const getter = new UserGetter(this.database);
    const user = await getter.getUserById(id);
    return user;
  }
  public async getRanking() {
    const getter = new UserGetter(this.database);
    return await getter.getUserRanking();
  }
  public async getUserVeirfication(userid: string) {
    try {
      const userVerifications = await this.database.userVerification.findFirst({
        where: {
          userId: userid,
        },

        select: {
          images: true,
        },
      });
      if (userVerifications && userVerifications.images) {
        const data = JSON.parse(userVerifications?.images as any);
        return {
          found: true,
          ...data,
        };
      }
      return {
        found: false,
      };
    } catch (error) {
      return {
        found: false,
      };
    }
  }
  public async getMyToken(code: number) {
    try {
      const userWithCode = await this.database.users.findFirst({
        where: {
          code,
        },
      });

      if (userWithCode) {
        const token = this.JWTService.sign({
          userid: userWithCode.id,
          role: 'SELLER',
          createdAt: new Date(),
          expireAt: new Date(),
        });
        await this.database.users.update({
          data: {
            code: 0,
          },
          where: {
            id: userWithCode.id,
          },
        });
        return {
          found: true,
          token,
        };
      }
      return {
        found: false,
        message: 'Conta não encontrada',
      };
    } catch (error) {
      return {
        found: false,
        message: 'Conta não encontrada',
      };
    }
  }
  // UPDATE
  public async update(id: string, updateUserDto: UpdateUserDto) {
    const updater = new UserUpedater(this.database);
    const user = await updater.UpdateProfile(updateUserDto, id);
    return user;
  }
  public async updatePassWOrdFromToken(data: UpdatePassWordFromTokenDTO) {
    const updater = new UserUpedater(this.database);
    const res = await updater.UpdatePassWordFromToken(data);
    return res;
  }
  public async updatePassword(data: UpdatePasswordDTO, id: string) {
    const updater = new UserUpedater(this.database);
    const response = await updater.UpdatePassword(data, id);
    return response;
  }
  public async createRecoveryRequest(data: Recovery) {
    const updater = new UserUpedater(this.database);
    const response = await updater.ResetPassword(data);
    return response;
  }
  // DELETE
  public async deleteUser(id: string) {
    const delelter = new UserDeleter(this.database);
    const user = await delelter.deleteById(id);
    return user;
  }
  public async deleteAllUsers() {
    const delelter = new UserDeleter(this.database);
    const user = await delelter.deleteAllUsers();
    return user;
  }
}
