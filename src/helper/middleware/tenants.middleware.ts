import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from 'src/tenants/tenants.service';

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
  constructor(private tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id']?.toString();
    if (tenantId) {
      try {
        const tenantExists = await this.tenantsService.getTenantById(tenantId);
        if (!tenantExists) {
          throw new NotFoundException('Tenant does not exist');
        }
        req['x-tenant-id'] = tenantId;
      } catch (error) {
        console.error(`Tenant validation failed: ${error.message}`);
        throw new NotFoundException('Tenant does not exist');
      }
    }
    next();
  }
}
