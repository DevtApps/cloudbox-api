import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/database/entities/user.entity';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/policy/role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user }:{user: User} = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role.includes(role));
  }
}