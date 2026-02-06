import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { UserGroupsService } from '../../services/userGroups.service';
import { UserGroup, UserGroupMember } from '../../models/UserGroup';
import { MatDialog } from '@angular/material/dialog';
import { EditIdNameFormComponent } from '../../components/edit-id-name-form/edit-id-name-form.component';
import { AddPeopleFormComponent } from '../../components/add-people-form/add-people-form.component';
import {
  DeleteConfirmationComponent,
  DeleteConfirmationData,
} from '../../components/delete-confirmation/delete-confirmation.component';

import { PageBaseComponent } from '../page-base/page-base.component';
import { DatePipe } from '@angular/common';
import { PortalUser } from '../../models/PortalUser';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import {
  getInitial,
  getUserColor,
  getDisplayName,
} from '../../../utils/user.utils';

@Component({
  selector: 'app-user-groups',
  imports: [
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBar,
    MatMenuModule,
  ],
  templateUrl: './user-groups.component.html',
  styleUrl: './user-groups.component.scss',
  providers: [DatePipe],
})
export class UserGroupsComponent extends PageBaseComponent implements OnInit {
  readonly groups = signal<UserGroup[]>([]);
  readonly dialog = inject(MatDialog);
  override readonly createForm = input.required<any>();
  selectedUsers: UserGroupMember[] = [];
  protected readonly getUserColor = getUserColor;
  protected readonly getInitial = getInitial;
  protected readonly getDisplayName = getDisplayName;

  constructor(service: UserGroupsService) {
    super(service);
  }

  override ngOnInit(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe((data: UserGroup[]) => {
      this.isLoading.set(false);
      this.groups.set(data);
    });
  }

  remove(user: UserGroupMember, userGroup: UserGroup): void {
    const { userId, username, name } = user;

    const index = userGroup.members!.findIndex(
      (m: UserGroupMember) => m.userId === userId,
    );
    if (index < 0) {
      return;
    }

    userGroup.members!.splice(index, 1);

    (this.service as UserGroupsService)
      .removeMember(userId, userGroup.id!)
      .subscribe({
        next: () => {
          this.reload();
        },
        error: (err) => {
          this.handleException(
            err,
            'There was a problem removing the user from the group.',
          );
        },
      });
  }

  openCreateForm() {
    const dialogRef = this.dialog.open(EditIdNameFormComponent, {
      data: {
        mode: 'add',
        type: 'user group',
        data: {},
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { data } = result;
        const newUserGroup: UserGroup = {
          groupName: data.name as string,
        };

        this.service.add(newUserGroup).subscribe({
          next: () => {
            this.reload();
          },
          error: (err) => {
            this.handleException(
              err,
              'There was a problem adding the user group.',
            );
          },
        });
      }
    });
  }

  openAddPeopleModal(group: UserGroup) {
    let selectedUsers: PortalUser[] =
      group.members?.map((u) => {
        return {
          userId: u.userId,
          name: u.name,
          username: u.username,
        } as PortalUser;
      }) || [];

    const dialogRef = this.dialog.open(AddPeopleFormComponent, {
      data: {
        title: 'Add Members',
        groupId: group.id,
        existingUsers: selectedUsers,
      },
      width: '400px',
      height: 'auto',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((selectedUsersInModal) => {
      if (!selectedUsersInModal || !Array.isArray(selectedUsersInModal)) {
        return;
      }

      this.isLoading.set(true);

      const newMembersFromModal: UserGroupMember[] = selectedUsersInModal.map(
        (u: PortalUser) => {
          return {
            userId: u.userId,
            name: u.name,
            username: u.username,
          } as UserGroupMember;
        },
      );

      const existingMembers = group.members || [];
      const updatedMembers = [
        ...existingMembers,
        ...newMembersFromModal,
      ].filter(
        (member, index, self) =>
          index === self.findIndex((m) => m.userId === member.userId),
      );

      this.groups.update((currentGroups) => {
        const index = currentGroups.findIndex((g) => g.id === group.id);
        if (index > -1) {
          const newGroups = [...currentGroups];
          newGroups[index] = { ...newGroups[index], members: updatedMembers };
          return newGroups;
        }
        return currentGroups;
      });

      const groupToUpdate: UserGroup = { ...group, members: updatedMembers };

      (this.service as UserGroupsService).editMembers(groupToUpdate).subscribe({
        next: () => {
          this.reload();
          this.isLoading.set(false);
        },
        error: (err) => {
          this.handleException(
            err,
            'There was a problem updating the group members.',
          );
          this.isLoading.set(false);
        },
      });
    });
  }

  protected override reload(): void {
    this.service.getAll().subscribe((data: UserGroup[]) => {
      this.groups.set(data);
      this.isLoading.set(false);
    });
  }

  openEditForm(group: UserGroup) {
    const dialogRef = this.dialog.open(EditIdNameFormComponent, {
      data: {
        mode: 'edit',
        type: 'user group',
        data: {
          id: group.id,
          name: group.groupName,
        },
      },
    });
    dialogRef.afterClosed().subscribe((form) => {
      if (!form) {
        return;
      }

      this.isLoading.set(true);
      const { data } = form;
      const updatedGroup: UserGroup = {
        id: data.id,
        groupName: data.name,
      };

      this.service.edit(updatedGroup).subscribe({
        next: () => {
          this.reload();
        },
        error: (err) => {
          this.handleException(
            err,
            'There was a problem editing the user group.',
          );
          this.isLoading.set(false);
        },
      });
    });
  }

  deleteGroup(group: UserGroup) {
    // Aquí implementa la lógica para eliminar el grupo
  }
}
