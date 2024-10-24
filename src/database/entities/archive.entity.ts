import { UUID } from "sequelize";
import { UUIDV4 } from "sequelize";
import { AfterFind, BelongsTo, Column, Default, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "./user.entity";
import { ArchivePolicy } from "./archive-policy.entity";
import { ENUM } from "sequelize";
import { ArchiveType } from "src/enum/arhive-type.enum";

@Table({tableName:"archive"})
export class Archive extends Model<Archive>{

    
    @Default(UUIDV4)
    @PrimaryKey
    @Column(UUID)
    uid: string

    @Column
    name: string

    @Column({field:'mime-type'})
    mimeType:string

    @Column
    size: number

    @Column(ENUM<ArchiveType>(...Object.values(ArchiveType)))
    type: string 

    @Column
    isPublic: boolean

    @Column
    authTag: string

    // @Column
    // token: string

    
    preview: string

    @ForeignKey(()=>User)
    @Column(UUID)
    userUid: string

    @ForeignKey(()=>Archive)
    @Column(UUID)
    parentUid: string

    @BelongsTo(()=>User)
    user:User

    @HasMany(()=>ArchivePolicy)
    policy: ArchivePolicy 

   

    @BelongsTo(()=>Archive,{onDelete:'CASCADE', })
    parent: Archive


    
   
}