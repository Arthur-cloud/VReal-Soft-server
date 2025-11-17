import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './gateways/events.gateway';

@Module({
  imports: [JwtModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WebsocketModule {}
