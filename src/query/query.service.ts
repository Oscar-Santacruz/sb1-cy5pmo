import { Injectable } from '@nestjs/common';
import { Db2Service } from '../db2/db2.service';
import { QueryParamsDto } from './dto/query.params.dto';

@Injectable()
export class QueryService {
  constructor(private readonly db2Service: Db2Service) {}

  async getJobData(params: QueryParamsDto) {
    // Construir la consulta base
    let query = `
      SELECT TIMESTAMP, JOB_NAME, JOB_TYPE, AUTHORIZATION_NAME, JOB_STATUS, SUBSYSTEM
      FROM mcleda.lck9
      WHERE DATE(TIMESTAMP) >= '${params.startDate}'
    `;

    // Agregar filtro de fecha fin si existe
    if (params.endDate) {
      query += ` AND DATE(TIMESTAMP) <= '${params.endDate}'`;
    } else {
      query += ` AND DATE(TIMESTAMP) = '${params.startDate}'`;
    }

    // Agregar filtro de usuario si existe
    if (params.user) {
      query += ` AND JOB_NAME LIKE '%${params.user}%'`;
    }

    // Ordenar por timestamp descendente
    query += ` ORDER BY TIMESTAMP DESC`;

    return this.db2Service.executeQuery(query);
  }
}