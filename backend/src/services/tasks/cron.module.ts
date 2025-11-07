import { Module } from "@nestjs/common";
import { TasksService } from "./cron.service";
import DatabaseService from "../database/database.service";



@Module({
  providers: [TasksService, DatabaseService],
})
export default class CronModule {}