import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypegooseModule } from 'nestjs-typegoose';
import { Subscriber } from './entities/subscriber.entity';
@Module({
  imports: [
    TypegooseModule.forRoot(
      process.env.MONGODB_URL || 'mongodb://localhost/cowin-ping',
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
    ),
    TypegooseModule.forFeature([Subscriber]),
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
