import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Put,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  public async create(
    @Body() createIntegrationDto: CreateIntegrationDto,
    @Headers('userid') userid: string,
  ) {
    createIntegrationDto.userid = userid;
    return await this.integrationsService.create(createIntegrationDto);
  }

  @Get()
  public async findAll(@Headers('userid') userid: string) {
    return this.integrationsService.findAll(userid);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() data: CreateIntegrationDto,
    @Headers('userid') userid: string,
  ) {
    data.userid = userid;
    return await this.integrationsService.update(id, data);
  }

  @Delete(':integrationid')
  public async delete(
    @Param('integrationid') integrationid: string,
    @Headers('userid') userid: string,
  ) {
    return await this.integrationsService.delete(userid, integrationid);
  }
}
