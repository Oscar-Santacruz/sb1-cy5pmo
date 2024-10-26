import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as winston from 'winston';
import * as WinstonSeq from '@datalust/winston-seq';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Aplicación');

  // Configuración de seguridad
  app.use(helmet());
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST'],
  });

  // Compresión de respuestas
  app.use(compression());

  // Validación de datos
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Documentación Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Consultas DB2')
    .setDescription('API para ejecutar consultas DB2 con caché y manejo de errores')
    .setVersion('1.0')
    .addTag('Consultas')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuración de logs con Seq
  const winstonLogger = winston.createLogger({
    transports: [
      new WinstonSeq({
        serverUrl: configService.get('seq.url'),
        apiKey: configService.get('seq.apiKey'),
        handleExceptions: true,
        handleRejections: true,
        onError: (e) => logger.error('Error en el transporte de logs: ' + e.message),
      }),
    ],
  });

  app.useLogger(winstonLogger);
  
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  logger.log(`Servidor iniciado en el puerto ${port}`);
}
bootstrap();