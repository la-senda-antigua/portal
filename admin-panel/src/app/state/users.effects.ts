import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {UsersActions, UsersApiActions} from './users.actions';
import { UsersService } from '../services/users.service';
import { UserGroupsService } from '../services/userGroups.service';

@Injectable()
export class UsersEffects {
    private readonly actions$ = inject(Actions);
    private readonly userService = inject(UsersService);
    private readonly userGroupsService = inject(UserGroupsService);

    loadUsers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.loadUsers),
            switchMap(() =>
                this.userService.getAll().pipe(
                    map(users => UsersApiActions.loadUsersSuccess({ users })),
                    catchError(error => of(UsersApiActions.loadUsersFailure({ error })))
                )
            )
        )
    );

    loadUserGroups$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.loadUserGroups),
            switchMap(() =>
                this.userGroupsService.getAll().pipe(
                    map(groups => UsersApiActions.loadUserGroupsSuccess({ groups })),
                    catchError(error => of(UsersApiActions.loadUserGroupsFailure({ error })))
                )
            )
        )
    );

    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.addUser),
            switchMap(({ user }) =>
                this.userService.add(user).pipe(
                    map(newUser => UsersApiActions.addUserSuccess({ user: newUser })),
                    catchError(error => of(UsersApiActions.addUserFailure({ error })))
                )
            )
        )
    );

    updateUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.updateUser),
            switchMap(({ userId, changes }) =>
                this.userService.edit(changes).pipe(
                    map(updatedUser => UsersApiActions.updateUserSuccess({ userId, changes: updatedUser })),
                    catchError(error => of(UsersApiActions.updateUserFailure({ error })))
                )
            )
        )
    );

    deleteUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.removeUser),
            switchMap(({ userId }) =>
                this.userService.delete(userId).pipe(
                    map(() => UsersApiActions.removeUserSuccess({ userId })),
                    catchError(error => of(UsersApiActions.removeUserFailure({ error })))
                )
            )
        )
    );
    
    createUserGroup$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.addUserGroup),
            switchMap(({ group }) =>
                this.userGroupsService.add(group).pipe(
                    map(newGroup => UsersApiActions.addUserGroupSuccess({ group: newGroup })),
                    catchError(error => of(UsersApiActions.addUserGroupFailure({ error })))
                )
            )
        )
    );

    updateUserGroup$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.updateUserGroup),
            switchMap(({ groupId, changes }) =>
                this.userGroupsService.edit(changes).pipe(
                    map(updatedGroup => UsersApiActions.updateUserGroupSuccess({ groupId, changes: updatedGroup })),
                    catchError(error => of(UsersApiActions.updateUserGroupFailure({ error })))
                )
            )
        )
    );

    deleteUserGroup$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.removeUserGroup),
            switchMap(({ groupId }) =>
                this.userGroupsService.delete(groupId).pipe(
                    map(() => UsersApiActions.removeUserGroupSuccess({ groupId })),
                    catchError(error => of(UsersApiActions.removeUserGroupFailure({ error })))
                )
            )
        )
    );
}