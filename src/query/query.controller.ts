import { Controller, Post, Body, UseInterceptors, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueryService } from './query.service';
import { QueryParamsDto } from './dto/query.params.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { RateLimit } from '@nestjs/throttler';

@ApiTags('Query')
@Controller('query')
@UseInterceptors(LoggingInterceptor)
@UseFilters(AllExceptionsFilter)
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post('jobs')
  @RateLimit({ limit: 100, ttl: 60 })
  @ApiOperation({ summary: 'Get job data with date range and user filter' })
  @ApiResponse({ 
    status: 200, 
    description: 'Query executed successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          TIMESTAMP: { type: 'string', format: 'date-time' },
          JOB_NAME: { type: 'string' },
          JOB_TYPE: { type: 'string' },
          AUTHORIZATION_NAME: { type: 'string' },
          JOB_STATUS: { type: 'string' },
          SUBSYSTEM: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 403, description: 'Insufficient privileges' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getJobs(@Body() params: QueryParamsDto) {
    return await this.queryService.getJobData(params);
  }
}