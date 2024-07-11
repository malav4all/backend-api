import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FormBuilderResolver } from './form-builder.resolver';
import { FormBuilderService } from './form-builder.service';
import { TenantsMiddleware } from '@imz/helper/middleware/tenants.middleware';

@Module({
  providers: [FormBuilderResolver, FormBuilderService],
  exports: [FormBuilderService],
})
export class FormBuilderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(FormBuilderResolver);
  }
}
