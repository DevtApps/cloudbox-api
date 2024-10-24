import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { ArchivePolicy } from 'src/database/entities/archive-policy.entity';
import { Reflector } from '@nestjs/core';
import { Policy } from 'src/enum/policy/box.policy';
import { POLICIES_KEY, REQUIRED_POLICIES_KEY } from './policy.decorator';
import { Session } from './current-session.decorator';
import { Op } from 'sequelize';
import { Archive } from 'src/database/entities/archive.entity';
import { getHierarch } from '../util/storage.util';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredPolicies = this.reflector.getAllAndOverride<Policy[]>(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isRequired = this.reflector.getAllAndOverride<boolean>(REQUIRED_POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (request.query.token) {

      let token = request.query.token

      try {
        let data = this.jwtService.verify(token)

        return true;
      } catch (e) {
        throw new UnauthorizedException('token has expired')
      }
    }

    if (!request['session']) {
      throw new UnauthorizedException()
    }
    if (!requiredPolicies) {
      return true;
    }
    if (!request['session']) {
      throw new UnauthorizedException();
    }

    console.log(requiredPolicies)


    try {

      let session: Session = request['session'];

      let { archiveUid } = request.params

      let archive = await Archive.findByPk(archiveUid)

      if (!archive) {
        throw new NotFoundException('File not exists')
      }
      if (archive.isPublic) {
        return true;
      }

      let hierarch = await getHierarch(archive.uid)

      let policies = await ArchivePolicy.findAll({
        where: {
          archiveUid: hierarch,
          userUid: session.uid,
          policy: requiredPolicies.concat(Policy.MANAGE)
        }
      })

      if (isRequired) {

        for (let p of requiredPolicies) {
          let grant = policies.find((e) => e.policy == p) != undefined
          if (!grant) {
            throw new ForbiddenException('Necessary permissions: ' + requiredPolicies.join(', '));
          }
        }
      }


      if (policies.length == 0) {
        throw new ForbiddenException('Necessary one or more permissions: ' + requiredPolicies.join(', '));
      }

      return true;


    } catch (e) {
      console.log(e)
      if (e instanceof ForbiddenException) {
        throw new ForbiddenException(e.message);
      }
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new UnauthorizedException();
    }
    return true;
  }

}