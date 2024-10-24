import { Body, Controller, Delete, Get, Header, Headers, Param, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BoxService } from './box.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFile } from 'src/database/dto/upload-file.dto';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateFolder } from 'src/database/dto/create-folder.dto';
import { AuthGuard, CurrentSession, Session } from 'box-common/common';
import { PolicyGuard } from 'box-common/common/auth/policy.guard';
import { Policies, RequirePolicies } from 'box-common/common/auth/policy.decorator';
import { Policy } from 'src/enum/policy/box.policy';
import { CreatePolicyDto } from 'src/database/dto/create-policy.dto';
import { UpdateArchive } from 'src/database/dto/update-archive.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { QueryPaginationDto } from 'src/database/pagination';
import { Request, Response } from 'express';

@ApiBearerAuth()
@Controller('box')
export class BoxController {
  constructor(private readonly boxService: BoxService) {}


  @UseGuards(AuthGuard)
  @Get('usage')
  usage(@CurrentSession() session: Session){

   return  this.boxService.usage(session.uid);
  }
  
  @UseGuards(AuthGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('/folder')
  createFolder(@CurrentSession() session: Session, @Body() createFolder: CreateFolder){
    return this.boxService.createFolder(session, createFolder.name, createFolder.parent)
  }

  @UseGuards( PolicyGuard)
  @Get('/share/archive/:archiveUid')
  sharedArchive(@CurrentSession() session: Session,@Req() req: Request, @Res() response: Response, @Param('archiveUid') archive: string){
   
    
   
    return this.boxService.createReadableArchive(session,archive, req, response)
  }


 


  @Policies(Policy.MANAGE, Policy.READWRITE)
  @UseGuards(AuthGuard, PolicyGuard)
  @Post('/share/:archiveUid')
  share(@CurrentSession() session: Session, @Param('archiveUid') archive: string){
    return this.boxService.createShareLink(session,archive)
  }

  
 
  
  @UseGuards(AuthGuard, PolicyGuard)
  @Get()
  listFolderRoot(@CurrentSession() session: Session){
    return this.boxService.listFolder(session,'root')
  }

  @UseGuards(AuthGuard)
  @Get('/recents')
  recentArchives(@CurrentSession() session: Session, @Query() query: QueryPaginationDto){
    return this.boxService.recentArchives(session, query)
  }

  
  @Policies(Policy.READ, Policy.READWRITE)
  @UseGuards(AuthGuard, PolicyGuard)
  @Get('folder/:archiveUid')
  listFolder(@CurrentSession() session: Session,@Param('archiveUid') folder: string){
    return this.boxService.listFolder(session,folder)
  }

  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  upload(@CurrentSession() session: Session, @Body() upload: UploadFile, @UploadedFile() file: Express.Multer.File){

   return  this.boxService.uploadFile(session,file, upload.parent)
  }
  
  @Policies(Policy.READ, Policy.READWRITE)
  @UseGuards(AuthGuard, PolicyGuard)
  @ApiQuery({
    name:'w',
    required: false
  })
  @ApiResponse({
    status:200
  })
  @Get('/file/:archiveUid')
  read( @Param('archiveUid') file: string, @Query('w') w?: number){

   return  this.boxService.getFile(file, {w})
  }

  @Policies(Policy.MANAGE)
  @UseGuards(AuthGuard, PolicyGuard)
  @Delete('/:archiveUid')
  deleteArchive(@Param('archiveUid') file: string){
   return  this.boxService.deleteArchive(file)
  }

  @Policies(Policy.MANAGE)
  @UseGuards(AuthGuard, PolicyGuard)
  @Patch('/:archiveUid')
  updateArchive( @Param('archiveUid') archiveUid: string, @Body() updateArchive: UpdateArchive){

   return  this.boxService.updateArchive(archiveUid, updateArchive)
  }

  @Policies(Policy.MANAGE)
  @UseGuards(AuthGuard, PolicyGuard)
  @Post('/:archiveUid/policy')
  createPolicy(@CurrentSession() session: Session, @Param('archiveUid') archiveUid: string, @Body() createPolicy: CreatePolicyDto){

   return  this.boxService.createPolicy(session,createPolicy)
  }

  @Policies(Policy.MANAGE)
  @UseGuards(AuthGuard, PolicyGuard)
  @Delete('/:archiveUid/policy/:policyUid')
  removePolicy(@CurrentSession() session: Session, @Param('archiveUid') archiveUid: string,@Param('policyUid') policyUid: string){

   return  this.boxService.removePolicy(session,policyUid)
  }
}
