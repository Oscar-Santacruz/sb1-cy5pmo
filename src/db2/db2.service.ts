import { Injectable, Logger, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Pool } from 'node-jt400';

@Injectable()
export class Db2Service implements OnModuleInit {
  private pool: Pool;
  private readonly logger = new Logger(Db2Service.name);

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async onModuleInit() {
    try {
      this.pool = new Pool({
        host: this.configService.get('database.host'),
        user: this.configService.get('database.user'),
        password: this.configService.get('database.password'),
        database: this.configService.get('database.database')
      });

      // Probar conexión
      await this.pool.query('SELECT 1 FROM SYSIBM.SYSDUMMY1');
      this.logger.log('Pool de conexiones DB2 inicializado exitosamente');
    } catch (error) {
      this.logger.error('Error al inicializar el pool de conexiones DB2', error);
      throw new Error('Falló la conexión a la base de datos');
    }
  }

  async executeQuery(query: string): Promise<any> {
    const cacheKey = `query_${Buffer.from(query).toString('base64')}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      this.logger.log('Retornando resultado desde caché');
      return cachedResult;
    }

    try {
      this.logger.log('Ejecutando consulta: ' + query);
      const result = await this.pool.query(query);
      
      await this.cacheManager.set(cacheKey, result, 10000); // 10 segundos de caché
      this.logger.log('Consulta ejecutada exitosamente');

      return result;
    } catch (error) {
      this.logger.error('Error al ejecutar la consulta', error);

      if (error.message.includes('SQL0551N') || error.message.includes('Permission denied')) {
        throw new HttpException('Privilegios insuficientes', HttpStatus.FORBIDDEN);
      }

      throw new HttpException(
        'Ocurrió un error en la base de datos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async onApplicationShutdown() {
    try {
      await this.pool.close();
      this.logger.log('Pool de conexiones DB2 cerrado');
    } catch (error) {
      this.logger.error('Error al cerrar el pool de conexiones DB2', error);
    }
  }
}