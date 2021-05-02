import { prop } from '@typegoose/typegoose';

export class Subscriber {
  @prop()
  // tslint:disable-next-line: variable-name
  _id: string;
  @prop({ required: true })
  name: string;
}
