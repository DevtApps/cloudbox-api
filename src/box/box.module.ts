import { Module } from '@nestjs/common';
import { BoxService } from './box.service';
import { BoxController } from './box.controller';
import { EncryptionService, jwtConstants } from 'box-common/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
   
  ],
  controllers: [BoxController],
  providers: [BoxService, EncryptionService],
})
export class BoxModule {}
