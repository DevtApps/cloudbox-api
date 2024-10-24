import { UUIDV4 } from "sequelize";
import { UUID } from "sequelize";
import { BelongsTo, Column, Default, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Archive } from "./archive.entity";
import { User } from "./user.entity";

import { ENUM } from "sequelize";
import { Policy } from "src/enum/policy/box.policy";

@Table({tableName:"archive-policy"})
export class ArchivePolicy extends Model<ArchivePolicy>{

    @PrimaryKey
    @Default(UUIDV4)
    @Column(UUID)
    uid: string

    @ForeignKey(()=>Archive)
    @Column(UUID)
    archiveUid: string

    @ForeignKey(()=>User)
    @Column(UUID)
    userUid: string

    @Column(ENUM<Policy>(...Object.values(Policy)))
    policy: string

    @BelongsTo(()=>User)
    user: User

    @BelongsTo(()=>Archive)
    archive: Archive

}