import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaslAbilityFactory } from '../factories/casl-ability.factory';
import { CHECK_ABILITY } from '../decorators/check-abilities.decorator';
import { RequiredRule } from '../types/casl.types';
import { FilePermissionEntity } from '@db/data-access/data-access-file-permission';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    @InjectRepository(FilePermissionEntity)
    private filePermissionRepository: Repository<FilePermissionEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];

    if (rules.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Load user's permissions from database
    const permissions = await this.filePermissionRepository.find({
      where: [{ userId: user.id }, { email: user.email }],
    });

    const ability = this.caslAbilityFactory.createForUser(user, permissions);

    for (const rule of rules) {
      if (!ability.can(rule.action, rule.subject)) {
        throw new ForbiddenException(
          `You are not allowed to ${rule.action} this resource`,
        );
      }
    }

    return true;
  }
}
