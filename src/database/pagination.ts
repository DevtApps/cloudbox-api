
import { ApiProperty } from "@nestjs/swagger"
import { FindOptions, Includeable, Model, Order, WhereOptions } from "sequelize"

export interface ModelPagination {
    findAndCountAll: Function
    count: Function
}


export class QueryPaginationDto {

    @ApiProperty({required:false})
    page: number
    @ApiProperty({required:false})
    size: number
}
export interface QueryPagination {
    page: number
    size: number
}
export interface ResponsePagination {
    page: number
    total: number,
    data: any,
    size: number,
    maxPage:number
}


export async function getPagination<T>(options: FindOptions<T> ,model: ModelPagination, query:QueryPagination):Promise<ResponsePagination> {
   
    
    var page: number = (query.page ?? 0)
    page = page == 0 ? 0 : page - 1
    var size: number = query.size ?? 20

    var offset: number = page * size

    options.limit = Number.parseInt(size+'')
    options.offset = offset


    var {count, rows} = await model!.findAndCountAll(options)
    var total = count
    var maxPage: number = Number.parseInt(((total > 0 ? total : 1) / size).toString())
    maxPage += (((total > 0 ? total : 1) % size) > 0 ? 1 : 0)

    return {
        total:total,
        page:page+1,
        size,
        maxPage:maxPage,
        data:rows.map((e)=>e.dataValues),
      
    }




}