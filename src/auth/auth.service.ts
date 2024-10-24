import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as md5 from 'md5';
import { AuthSignIn } from 'src/database/dto/auth-signin.dto';
import { Limits } from 'src/database/entities/limits.entity';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(private jwtService: JwtService) { }
  async signIn(auth: AuthSignIn) {
    let user = await User.findOne({
      where: {
        email: auth.email
      }
    })

    if (user?.password !== md5(auth.password)) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
    const payload = { uid: user.uid, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signOut(auth: AuthSignIn) {

    let transaction = await User.sequelize.transaction()

    try{
    let user = await User.create({

      email: auth.email,
      password: auth.password
    },{
      transaction
    })

    let limit = await Limits.create({
      userUid: user.uid
    },{
      transaction
    })

    const payload = { uid: user.uid, email: user.email, role: user.role };
    
    await transaction.commit()
    
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }catch(e){
    transaction.rollback()

    throw new BadGatewayException({message:"Não foi possível criar sua conta"})
  }
  }
}
