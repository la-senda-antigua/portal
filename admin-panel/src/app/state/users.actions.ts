import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PortalUser } from '../models/PortalUser';
import { UserGroup, UserGroupDto } from '../models/UserGroup';

export const UsersActions = createActionGroup({
  source: 'Users',
  events: {
    'Load Users': emptyProps(),
    'Add User': props<{ user: PortalUser }>(),
    'Remove User': props<{ userId: string }>(),
    'Update User': props<{ userId: string; user: PortalUser }>(),
    'Load UserGroups': emptyProps(),
    'Add UserGroup': props<{ group: UserGroupDto }>(),
    'Remove UserGroup': props<{ groupId: string }>(),
    'Update UserGroup': props<{ groupId: string; userGroup: UserGroupDto }>(),
  },
});

export const UsersApiActions = createActionGroup({
  source: 'Users API',
  events: {
    'Load Users Success': props<{ users: PortalUser[] }>(),
    'Load Users Failure': props<{ error: any }>(),
    'Add User Success': props<{ user: PortalUser }>(),
    'Add User Failure': props<{ error: any }>(),
    'Remove User Success': props<{ userId: string }>(),
    'Remove User Failure': props<{ error: any }>(),
    'Update User Success': props<{
      userId: string;
      user: PortalUser;
    }>(),
    'Update User Failure': props<{ error: any }>(),
    'Load UserGroups Success': props<{ groups: UserGroupDto[] }>(),
    'Load UserGroups Failure': props<{ error: any }>(),
    'Add UserGroup Success': props<{ group: UserGroupDto }>(),
    'Add UserGroup Failure': props<{ error: any }>(),
    'Remove UserGroup Success': props<{ groupId: string }>(),
    'Remove UserGroup Failure': props<{ error: any }>(),
    'Update UserGroup Success': props<{
      groupId: string;
      userGroup: UserGroupDto;
    }>(),
    'Update UserGroup Failure': props<{ error: any }>(),
  },
});
