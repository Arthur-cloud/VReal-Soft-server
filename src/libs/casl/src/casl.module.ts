import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './factories/casl-ability.factory';
import { AbilitiesGuard } from './guards/abilities.guard';
import { DataAccessFilePermissionModule } from '@db/data-access/data-access-file-permission';

@Module({
  imports: [DataAccessFilePermissionModule],
  providers: [CaslAbilityFactory, AbilitiesGuard],
  exports: [CaslAbilityFactory, AbilitiesGuard],
})
export class CaslModule {}
