import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'sunaygandhi@gmail.com',
          pass: 'rjhijjwufukamiiy',
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
