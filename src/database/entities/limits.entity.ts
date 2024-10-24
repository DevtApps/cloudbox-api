import { UUID, UUIDV4 } from "sequelize";
import { Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "./user.entity";

@Table({tableName:"limits"})
export class Limits extends Model<Limits>{

   
    @Default(UUIDV4)
    @PrimaryKey
    @Column(UUID)
    uid: string

    //in megabytes
    @Default(51200.0)
    @Column(DataType.DOUBLE)
    limit: number

    //in megabytes
    @Default(0.0)
    @Column(DataType.DOUBLE)
    usage: number

    @ForeignKey(()=>User)
    @Column(UUID)
    userUid: string

}