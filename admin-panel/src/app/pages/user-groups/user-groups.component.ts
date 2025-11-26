import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { UserGroupsService } from '../../services/userGroups.service';
import { UserGroup, UserGroupMember } from '../../models/UserGroup';
import { MatDialog } from '@angular/material/dialog';
import { EditIdNameFormComponent } from '../../components/edit-id-name-form/edit-id-name-form.component';
import { PageBaseComponent } from '../page-base/page-base.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-groups',
  imports: [MatExpansionModule, MatIconModule, MatButtonModule],
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
    this.service.getAll().subscribe((data: UserGroup[]) => {
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
        const data: UserGroup = result.data;

        this.service.add(data).subscribe({
          next: () => {this.reload();},
          error: (err) => {this.handleException(err, 'There was a problem adding the item.');},
        });
      }
    });
  }

  protected override reload(): void {
    this.service.getAll().subscribe((data: UserGroup[]) => {
      this.groups.set(data);
    });
  }

}
