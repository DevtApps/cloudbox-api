import { ApiProperty } from "@nestjs/swagger";

export class UploadFile{

    @ApiProperty({type:'file', format:'binary'})
    file: string

   
    @ApiProperty({required: false})
    parent: string
}