import { JourneyService } from '@imz/journey/journey.service';
import { UserService } from '@imz/user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  constructor(
    private UserModalService: UserService,
    private JourneyModelService: JourneyService
  ) {}

  async getDashboardDetail() {
    try {
      const totalUser = await this.UserModalService.getAllUserCount();
      const totalJourney = await this.JourneyModelService.getJourneyCount();
      const ongoingJourney =
        await this.JourneyModelService.getOngoingJourneyCount();
      return { total: { totalUser, totalJourney, ongoingJourney } };
    } catch (error) {
      throw new Error(`Failed to create : ${error.message}`);
    }
  }
}
