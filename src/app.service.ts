import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// tslint:disable-next-line: no-var-requires
const fetch = require('node-fetch');
import * as moment from 'moment';
import * as path from 'path';

import { Subscriber } from './entities/subscriber.entity';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';

@Injectable()
export class AppService {
  private readonly district = '395';
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectModel(Subscriber)
    private readonly subscriberModel: ReturnModelType<typeof Subscriber>,
  ) {
    this.getSessions();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async getSessions() {
    const date = moment()
      .add(1, 'day')
      .format('DD-MM-YYYY');
    try {
      // get data from cowin api
      const res = await fetch(
        `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${this.district}&date=${date}`,
      );
      const body = await res.text();
      this.logger.log(body);
      const sessions = JSON.parse(body).sessions;

      // check if session is open
      const openSessions: any[] = sessions.filter(
        i => i.min_age_limit < 45 && i.available_capacity > 0,
      );
      this.logger.log(`${sessions.length} sessions fetched and parsed`);

      // send notification
      if (openSessions.length > 0) {
        const emails = (await this.subscriberModel.find().select('_id')).map(
          i => i._id,
        );
        const emailBody = openSessions.map(i => {
          return `${i.name}-${i.available_capacity} doses`;
        });
        this.mailerService.sendMail({
          to: 'sunaygandhi@gmail.com',
          bcc: emails,
          subject: `Vaccination Slots on ${date}`,
          text: emailBody.toString(),
        });
        this.logger.log(
          `found ${openSessions.length} open sessions and sent ${emails.length} emails`,
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  // tslint:disable-next-line: variable-name
  async addSubscribers(name: string, _id: string) {
    return this.subscriberModel.create({ name, _id }).catch(error => {
      throw new ConflictException('duplicate subscriber');
    });
  }
}
