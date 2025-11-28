import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { UserGroupsService } from '../../services/userGroups.service';
import { UserGroup, UserGroupMember } from '../../models/UserGroup';
import { MatDialog } from '@angular/material/dialog';
import { EditIdNameFormComponent } from '../../components/edit-id-name-form/edit-id-name-form.component';
import { AddPeopleFormComponent } from '../../components/add-people-form/add-people-form.component';

import { PageBaseComponent } from '../page-base/page-base.component';
import { DatePipe } from '@angular/common';
import { PortalUser } from '../../models/PortalUser';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-user-groups',
  imports: [MatExpansionModule, MatIconModule, MatButtonModule, MatProgressBar],
  templateUrl: './user-groups.component.html',
  styleUrl: './user-groups.component.scss',
  providers: [DatePipe],
})
export class UserGroupsComponent extends PageBaseComponent implements OnInit {
  readonly groups = signal<UserGroup[]>([]);
  readonly dialog = inject(MatDialog);
  override readonly createForm = input.required<any>();
  selectedUsers: UserGroupMember[] = [];

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

  getInitial(user: UserGroupMember): string {
    const name = user.name || user.username;
    return name.charAt(0).toUpperCase();
  }

  getDisplayName(user: UserGroupMember): string {
    if (user.name) {
      return user.name.split(' ')[0];
    }
    return user.username.split('@')[0];
  }

  remove(user: UserGroupMember): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
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
        console.log('el data!', data);
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
              'There was a problem adding the user group.'
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
        }
      );

      const existingMembers = group.members || [];
      const updatedMembers = [
        ...existingMembers,
        ...newMembersFromModal,
      ].filter(
        (member, index, self) =>
          index === self.findIndex((m) => m.userId === member.userId)
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

      this.service.edit(groupToUpdate).subscribe({
        next: () => {
          this.reload();
          this.isLoading.set(false);
        },
        error: (err) => {
          this.handleException(
            err,
            'There was a problem updating the group members.'
          );
          this.isLoading.set(false);
        },
      });
    });
  }

  protected override reload(): void {
    this.service.getAll().subscribe((data: UserGroup[]) => {
      this.groups.set(data);
    });
  }
}
