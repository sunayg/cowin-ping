import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// tslint:disable-next-line: no-var-requires
const fetch = require('node-fetch');
import * as moment from 'moment';
@Injectable()
export class AppService {
  private readonly district = '395';
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly mailerService: MailerService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async getSessions() {
    const date = moment()
      .add(1, 'day')
      .format('DD-MM-YYYY');
    try {
      const res = await fetch(
        `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${this.district}&date=${date}`
      );
      const body = await res.text();
      Logger.log(body);
      const sessions = JSON.parse(body).sessions;
      const openSessions: any[] = sessions.filter(
        i => i.min_age_limit < 45 && i.available_capacity > 0,
      );
      this.logger.log(`${sessions.length} sessions fetched and parsed`);
      if (openSessions.length > 0) {
        const emailBody = openSessions.map(i => {
          return `${i.name}-${i.available_capacity} doses`;
        });
        this.mailerService.sendMail({
          to: ['sunaygandhi@gmail.com'],
          subject: `Vaccination Slots on ${date}`,
          text: emailBody.toString(),
        });
        this.logger.log(`found ${openSessions.length} open sessions`);
      }
    } catch (e) {
      Logger.error(e);
    }
  }
}
