import { UUIDV4 } from "sequelize";
import { UUID } from "sequelize";
import { BeforeCreate, Column, Default, HasMany, HasOne, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";

import { Archive } from "./archive.entity";

import { ENUM } from "sequelize";
import { Role } from "src/enum/policy/role";
import * as md5 from "md5";
import { Limits } from "./limits.entity";


@Table({tableName:'users'})
export class User extends Model<User>{

    @Default(UUIDV4)
    @PrimaryKey
    @Column(UUID)
    uid: string

    @Unique
    @Column
    email: string

    @Column
    password: string

    @Default(Role.User)
    @Column(ENUM<Role>(...Object.values(Role)))
    role: string
    
    @HasMany(()=>Archive)
    archives: Archive[]

    @HasOne(()=>Limits,{onDelete: 'CASCADE'})
    limit: Limits

    @BeforeCreate
    static onCreate(user: User){

        user.password = md5(user.password)
        return user;
    }
}