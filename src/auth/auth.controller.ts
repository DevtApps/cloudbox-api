import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignIn } from 'src/database/dto/auth-signin.dto';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('signin')
  signIn(@Body() auth: AuthSignIn){

    return this.authService.signIn(auth)

  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('signup')
  signOut(@Body() auth: AuthSignIn){

    return this.authService.signOut(auth)

  }
}
