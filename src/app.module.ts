import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Db2Service } from './db2/db2.service';
import { QueryController } from './query/query.controller';
import { QueryService } from './query/query.service';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 10000, // 10 seconds
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
  ],
  controllers: [QueryController],
  providers: [
    Db2Service,
    QueryService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}