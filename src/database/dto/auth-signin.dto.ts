import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsStrongPassword, MinLength } from "class-validator";

export class AuthSignIn{
    @IsEmail({},{message:"E-mail inválido"})
    @ApiProperty()
    email: string

    
    @IsNotEmpty({message:"Senha inválida"})
    @MinLength(8,{message:"Senha muito curta"})
    @ApiProperty()
    password: string
}