import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { UserGroupsService } from '../../services/userGroups.service';
import { UserGroup, UserGroupMember } from '../../models/UserGroup';

@Component({
  selector: 'app-user-groups',
  imports: [MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './user-groups.component.html',
  styleUrl: './user-groups.component.scss',
})
export class UserGroupsComponent implements OnInit {
  readonly groups = signal<UserGroup[]>([]);
  selectedUsers: UserGroupMember[] = [];

  constructor(private service: UserGroupsService) {}

  ngOnInit(): void {
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
}
