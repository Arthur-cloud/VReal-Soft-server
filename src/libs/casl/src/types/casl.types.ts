import { Ability, InferSubjects } from '@casl/ability';
import { Action } from '../enums/casl-action.enum';
import { UserEntity } from '@db/data-access/data-access-user';
import { FileEntity } from '@db/data-access/data-access-file';
import { FolderEntity } from '@db/data-access/data-access-folder';

export type Subjects =
  | InferSubjects<typeof FileEntity | typeof FolderEntity | typeof UserEntity>
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

export interface RequiredRule {
  action: Action;
  subject: any;
}
