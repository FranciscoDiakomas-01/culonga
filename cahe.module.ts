import { Global, Module } from "@nestjs/common";
import CacheService from "./cahe.service";


@Module({
  providers: [CacheService],
  exports : [CacheService]
})
@Global()
export default class CacheModule{}