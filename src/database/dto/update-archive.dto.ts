import { ApiProperty } from "@nestjs/swagger";

export class UpdateArchive{

    @ApiProperty()
    name: string

    @ApiProperty()
    isPublic: boolean
}