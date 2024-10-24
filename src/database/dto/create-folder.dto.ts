import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "sequelize-typescript";

export class CreateFolder{

    @ApiProperty()
    name: string

    @ApiProperty({required:false})
    parent: string

}