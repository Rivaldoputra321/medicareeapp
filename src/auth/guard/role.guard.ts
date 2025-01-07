import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { peran, Role } from 'src/entities/roles.entity';
import { Repository } from 'typeorm';
// Sesuaikan path dengan struktur project

// Create decorator for roles
export const ROLES_KEY = 'roles';
export const Roles = (...roles: peran[]) => {
  return (_target: any, _key?: string | symbol, descriptor?: any) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
  };
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from decorator
    const requiredRoles = this.reflector.get<peran[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists and has roleId
    if (!user || !user.roleId) {
      throw new UnauthorizedException('User role not found');
    }

    // Get role from database
    const userRole = await this.roleRepository.findOne({
      where: { id: user.roleId }
    });

    if (!userRole) {
      throw new UnauthorizedException('Role not found');
    }

    // Check if user's role is included in the required roles
    if (!requiredRoles.includes(userRole.name)) {
      throw new UnauthorizedException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}