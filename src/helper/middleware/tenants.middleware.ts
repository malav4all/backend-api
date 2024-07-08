import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from 'src/tenants/tenants.service';

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
  constructor(private tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id']?.toString();
    if (tenantId) {
      console.log(`Tenant ID: ${tenantId}`);
      const tenantExists = await this.tenantsService.getTenantById(tenantId);
      if (!tenantExists) {
        console.warn('Tenant does not exist');
      } else {
        req['x-tenant-id'] = tenantId;
      }
    } else {
      console.warn('No tenant ID provided in the request headers');
    }

    next();
  }
}
