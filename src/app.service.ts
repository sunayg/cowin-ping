import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// tslint:disable-next-line: no-var-requires
const fetch = require('node-fetch');
import * as moment from 'moment';
import * as path from 'path';

import low = require('lowdb');

import FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(
  path.join('..', '.config', 'cowin-ping', 'data.json'),
);

const db = low(adapter);

db.defaults({
  subscribers: [{ email: 'sunaygandhi@gmail.com', name: 'Sunay Gandhi' }],
}).write();

@Injectable()
export class AppService {
  private readonly district = '395';
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly mailerService: MailerService) {
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
        const emails = [
          ...new Set(
            db
              .get('subscribers')
              .map('email')
              .value(),
          ),
        ];
        const emailBody = openSessions.map(i => {
          return `${i.name}-${i.available_capacity} doses`;
        });
        this.mailerService.sendMail({
          to: 'sunaygandhi@gmail.com',
          bcc: emails as string[],
          subject: `Vaccination Slots on ${date}`,
          text: emailBody.toString(),
        });
        this.logger.log(`found ${openSessions.length} open sessions`);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  addSubscribers(name, email) {
    db.get('subscribers')
      .push({ name, email })
      .write();
    return { name, email };
  }
}
