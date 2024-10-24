import { ApiProperty } from "@nestjs/swagger";
import { Policy } from "src/enum/policy/box.policy";

export class CreatePolicyDto{

    @ApiProperty()
    archiveUid: string

    @ApiProperty()
    userUid:string

    @ApiProperty({type:'enum', enum:Policy})
    policy: Policy
}