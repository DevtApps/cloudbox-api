import { UUID } from "sequelize";
import { UUIDV4 } from "sequelize";
import { Column, Default, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({tableName:"plans"})

export class Plan extends Model<Plan>{

    @Default(UUIDV4)
    @PrimaryKey
    @Column(UUID)
    uid: string

    @Column
    name: string

    @Column
    price: number

    @Column
    period_days: number

    @Column
    period_description: string

    @Column
    description: string

}