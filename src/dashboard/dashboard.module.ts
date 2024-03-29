import { Module } from '@nestjs/common';
import { DashboardResolver } from './dashboard.resolver';
import { DashboardService } from './dashboard.service';
import { UserModule } from '@imz/user/user.module';
import { JourneyModule } from '@imz/journey/journey.module';

@Module({
  imports: [UserModule, JourneyModule],
  providers: [DashboardResolver, DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
