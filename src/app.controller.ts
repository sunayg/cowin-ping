import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }

  @Post('/subscribe')
  @Render('subscribe')
  postSubscribers(@Body('name') name: string, @Body('email') email: string) {
    return this.appService.addSubscribers(name, email);
  }
}
