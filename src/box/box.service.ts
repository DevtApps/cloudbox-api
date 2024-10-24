import { BadGatewayException, BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createReadStream, mkdir, mkdirSync, readFileSync, rmdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { Archive } from 'src/database/entities/archive.entity';
import { extension } from 'mime-types'
import { EncryptionService, getHierarch, Session } from 'box-common/common';
import { ArchiveType } from 'src/enum/arhive-type.enum';
import { ArchivePolicy } from 'src/database/entities/archive-policy.entity';
import { Policy } from 'src/enum/policy/box.policy';
import { QueryTypes } from 'sequelize';
import { CreatePolicyDto } from 'src/database/dto/create-policy.dto';
import { UpdateArchive } from 'src/database/dto/update-archive.dto';
import { getPagination, QueryPagination } from 'src/database/pagination';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import * as throttle from 'throttle'
import { Stream, Transform } from 'stream';
import { Limits } from 'src/database/entities/limits.entity';
import * as sharp from 'sharp';

@Injectable()
export class BoxService {
  async usage(uid: string) {
    let limit = await Limits.findOne({
      where: {
        userUid: uid
      },
      mapToModel: true,

    })

    return limit

  }
  async createReadableArchive(session: Session, archiveUid: string, request: Request, response: Response) {

    let archive = await Archive.findByPk(archiveUid);


    console.log(archive.authTag)
    if (archive.type == "file") {
      let hierarch = await getHierarch(archiveUid);

      let path = resolve(join(process.env.point, ...hierarch));

      console.log(path)


      const stat = statSync(path);
      const fileSize = stat.size;
      const range = response.req.headers.range;

      const { mtime } = stat;

      const lastModified = mtime.toUTCString();


      // if (range) {
      //   const parts = range.replace(/bytes=/, '').split('-');
      //   const start = parseInt(parts[0], 10);
      //   const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      //   const chunksize = end - start + 1;
      //   const file = createReadStream(path, { start, end });


      //   const throttleStream = new throttle({ bps: 1.5 * 1024 * 1024 });


      //   const head = {
      //     'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      //     'Accept-Ranges': 'bytes',
      //     'Content-Length': chunksize,
      //     'Content-Type': archive.mimeType,

      //   };

      //   console.log('lendo do disco')

      //   response.writeHead(206, head);



      //   file.pipe(this.fileCipher.createDecryptionStream(Buffer.from(archive.authTag,'hex'))).pipe(response)



      //   //file.pipe(throttleStream).pipe().pipe(response);


      // } else {
      // Verifique o cabeçalho If-Modified-Since para suporte a cache
      const reqLastModified = response.req.headers['if-modified-since'];
      if (reqLastModified && new Date(reqLastModified) >= mtime) {
        response.status(304).end(); // Not Modified
        console.log('usando cache')
        return;
      }

      const head = {
        'Content-Length': fileSize,
        'Content-Type': archive.mimeType,
        'Accept-Ranges': 'bytes',

      };

      console.log('lendo do disco')

      response.writeHead(200, head);
      createReadStream(path).pipe(this.fileCipher.createDecryptionStream(Buffer.from(archive.authTag, 'hex'))).pipe(response);
      //  }

      return new StreamableFile(createReadStream(path), { type: archive.mimeType })
    } else {

      throw new BadRequestException("Couldn't open archive, is a folder");
    }
  }



  parseRange(range: string, fileSize: number): [number, number] {
    const positions = range.replace(/bytes=/, '').split('-');
    const start = parseInt(positions[0], 10);
    const end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1;

    return [start, end];
  }


  createShareLink(session: Session, archive: string, exp?: string) {

    exp = exp ?? '12h'

    var token = this.jwtService.sign({
      archiveUid: archive,

    }, {
      expiresIn: exp
    })

    return { url: process.env.BASE_URL + '/box/share/archive/' + archive + '?token=' + token, expiresIn: exp }

  }
  async recentArchives(session: Session, query: QueryPagination) {
    let data = await getPagination<Archive>({
      include: [
        {
          model: ArchivePolicy,
          where: {
            userUid: session.uid,
            policy: [Policy.MANAGE, Policy.READ, Policy.READWRITE]
          },
          attributes: [],
        }
      ],
      order: [['createdAt', 'desc']]

    }, Archive, query)



    return data;
  }




  constructor(private fileCipher: EncryptionService, private jwtService: JwtService) { }
  listFolder(session: Session, folder: string) {
    if (folder == 'root') {
      let tree = Archive.findAll({
        where: {
          userUid: session.uid,
          parentUid: null
        },

      })

      return tree
    }

    else {
      return Archive.findAll({

        where: {
          parentUid: folder,
        },

      })
    }
  }

  async updateArchive(archiveUid: string, updateArchive: UpdateArchive) {

    let archive = await Archive.findByPk(archiveUid)

    if (!archive) {

      if (!archive) {
        throw new BadRequestException('Archive not exists')
      }
    }

    await archive.update(updateArchive)

    return { message: "Archive updated" }
  }

  async createFolder(session: Session, name: string, parent: string = null) {

    let archive = await Archive.create({
      type: ArchiveType.FOLDER,
      name,
      userUid: session.uid,
      parentUid: parent,
      isPublic: false
    })

    let hierarch = await Archive.sequelize.query(
      `SELECT * FROM get_folder_hierarchy(:lastFolderUid::UUID)`,
      {
        replacements: { lastFolderUid: archive.uid },
        type: QueryTypes.SELECT,
      }
    );

    let _hierarch = hierarch.reverse().map((e) => e['uid'])




    let defaultPolicy = await ArchivePolicy.create({
      archiveUid: archive.uid,
      userUid: session.uid,
      policy: Policy.MANAGE
    })

    mkdirSync(resolve(process.env.point, ..._hierarch), { recursive: true })

    return { message: 'Folder created', uid: archive.uid }

  }

  async createPolicy(session: Session, createPolicy: CreatePolicyDto) {


    let policy = await ArchivePolicy.findOne({
      where: {
        userUid: createPolicy.userUid,
        policy: createPolicy.policy,
        archiveUid: createPolicy.archiveUid
      }
    })

    if (policy) {
      throw new BadRequestException('Policy already exists')
    }
    policy = await ArchivePolicy.create({

      userUid: createPolicy.userUid,
      policy: createPolicy.policy,
      archiveUid: createPolicy.archiveUid

    })

    if (policy) {

      return { message: 'Policy created' }
    } else {
      throw new BadRequestException('Policy do not created')
    }
  }


  async removePolicy(session: Session, policyUid: string) {


    let policy = await ArchivePolicy.findByPk(policyUid)

    if (!policy) {
      throw new BadRequestException('Policy not exists')
    }
    await policy.destroy()



    return { message: 'Policy removed' }

  }

  async uploadFile(session: Session, file: Express.Multer.File, parent?: string) {
    let buffer = file.buffer;

    let transaction = await Archive.sequelize.transaction()

    try {
      let archive = await Archive.create({
        type: ArchiveType.FILE,
        name: file.originalname,
        userUid: session.uid,
        parentUid: parent,
        isPublic: false,
        mimeType: file.mimetype,
        size: file.size
      }, {
        transaction
      })

      let defaultPolicy = await ArchivePolicy.create({
        archiveUid: archive.uid,
        userUid: session.uid,
        policy: Policy.MANAGE
      }, {
        transaction
      })
      let _hierarch = [];
      if (parent) {

        _hierarch = await getHierarch(parent)
      }



      let sizeInMb = ((file.size / 1024) / 1024)
      await Limits.increment('usage', {
        where: {
          userUid: session.uid,

        }, by: sizeInMb
        , transaction
      })


      let path = resolve(join(process.env.point, ..._hierarch, archive.uid))



      let encripted = this.fileCipher.encryptData(buffer)

      await Archive.update({
        authTag: encripted.authTag.toString('hex')
      }, {
        where: {
          uid: archive.uid
        },

        transaction
      })

      writeFileSync(path, encripted.encrypted)

      await transaction.commit()


      return { message: "File uploaded" }

    } catch (e) {
      transaction.rollback()
      console.log(e);
      return { message: "Não foi possível fazer o upload do arquivo" }
    }
  }


  async getFile(file: string, query: { w: number }) {

    let archive = await Archive.findByPk(file)

    if (!archive) {
      throw new NotFoundException('File not found');
    }



    let _hierarch = await getHierarch(file)

    let path = resolve(join(process.env.point, ..._hierarch))


    let buffer = readFileSync(path);




    let decrypted = this.fileCipher.decryptData(buffer, Buffer.from(archive.authTag, 'hex'))

    if (query.w) {
      let resized = await sharp(decrypted)
        .resize({ width: Number(query.w) }).rotate(-90).toBuffer()


      return new StreamableFile(resized, { type: archive.mimeType })
    }
    return new StreamableFile(decrypted, { type: archive.mimeType })
  }

  async deleteArchive(file: string) {
    let archive = await Archive.findByPk(file)

    let transaction = await Archive.sequelize.transaction()

    if (!archive) {
      throw new NotFoundException('File not found');
    }



    let _hierarch = await getHierarch(file)

    let path = resolve(join(process.env.point, ..._hierarch))

    await archive.destroy({transaction})

    try {
      if (archive.type == ArchiveType.FILE) {

        unlinkSync(path)

      } else {
        rmSync(path, { force: true, recursive: true })

      }
    } catch (e) {

      
     if(e.code == "ENOENT"){
      await transaction.commit()
     }else{
      await transaction.rollback()

      throw new BadGatewayException({message:"Não foi possível remover o arquivo"})
     }
      
    }


    return { message: "Archive removed" }
  }
}


