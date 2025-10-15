import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Req,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
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
import { Status } from 'generated/prisma';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Post('recovery')
  createRecoveryRequest(@Body() createUserDto: Recovery) {
    return this.usersService.createRecoveryRequest(createUserDto);
  }

  @Put('recovery')
  resetPassWord(@Body() createUserDto: UpdatePassWordFromTokenDTO) {
    return this.usersService.updatePassWOrdFromToken(createUserDto);
  }
  @Post('/uploadverificationsfile')
  createVerification(
    @Body() data: VerifyUserDTO,
    @Headers('userid') userid: string,
  ) {
    return this.usersService.createVerification(data, userid);
  }

  @Post('toogle')
  toogleUserVerification(
    @Body() data: ToogleUserVerification,
    @Headers('role') role: string,
  ) {
    if (role.toUpperCase() != 'ADMIN') {
      throw new UnauthorizedException('Não autorizado');
    }
    return this.usersService.toogleUserVerification(data);
  }
  @Get('verify/:id')
  getUserVerification(@Headers('role') role: string, @Param('id') id: string) {
    if (role.toUpperCase() != 'ADMIN') {
      throw new UnauthorizedException('Não autorizado');
    }
    return this.usersService.getUserVeirfication(id);
  }
  @Get('ranking')
  public async getRanking() {
    const data = await this.usersService.getRanking();
    return data;
  }

  @Get('gettoken/:code')
  public async getCode(@Param('code') code: string) {
    const data = await this.usersService.getMyToken(+code);
    return data;
  }
  @Post('auth')
  login(@Body() createUserDto: LoginDTO) {
    return this.usersService.login(createUserDto);
  }

  @Get()
  public async getAllUser(
    @Query('page') page: number = 1,
    @Headers('role') role: string,
    @Query('status') status: string = 'ALL',
  ) {
    if (role.toUpperCase() != 'ADMIN') {
      throw new UnauthorizedException('Não autorizado');
    }
    if (status != 'ALL') {
      return this.usersService.getAllUsersByStatus(page, status as Status);
    }
    return this.usersService.getAllUsers(page);
  }

  @Get('me')
  findOne(@Headers('userid') userid: string) {
    return this.usersService.getUserById(userid);
  }

  @Put('/credential')
  update(
    @Body() updateUserDto: UpdatePasswordDTO,
    @Headers('userid') userid: string,
    @Headers('role') role: string,
  ) {
    return this.usersService.updatePassword(updateUserDto, userid);
  }

  @Put()
  updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Headers('userid') userid: string,
  ) {
    return this.usersService.update(userid, updateUserDto);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Headers('userid') userid: string,
    @Headers('role') role: string,
  ) {
    if (role && role?.toUpperCase() == 'ADMIN') {
      return this.usersService.deleteUser(id);
    }
    throw new UnauthorizedException('Permisão inválida');
  }
  @Delete()
  deleteAllUser(
    @Headers('userid') userid: string,
    @Headers('role') role: string,
  ) {
    if (role && role?.toUpperCase() == 'ADMIN') {
      return this.usersService.deleteAllUsers();
    }
    throw new UnauthorizedException('Permisão inválida');
  }
}
