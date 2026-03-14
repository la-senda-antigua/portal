import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserGroup, UserGroupMember } from '../../models/UserGroup';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { Store } from '@ngrx/store';
import { selectUsers } from '../../state/appstate.selectors';
import { PortalUser } from '../../models/PortalUser';

@Component({
  selector: 'app-edit-user-group-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    MatIconModule,
    MatDividerModule,
    UserSelectorComponent,
    MatDialogModule
  ],
  templateUrl: './edit-user-group-form.component.html',
  styleUrls: ['./edit-user-group-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserGroupFormComponent {
  readonly dialogData = inject<UserGroup>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<EditUserGroupFormComponent>);
  readonly store = inject(Store);
  readonly users = this.store.selectSignal(selectUsers);
  readonly existingUsers = computed(()=>{
    return this.users().filter(user => this.dialogData.members?.some(member => member.userId === user.userId));
  })
  readonly form = new FormGroup({
    groupId: new FormControl(this.dialogData.id),
    groupName: new FormControl(this.dialogData.groupName, Validators.required),
    members: new FormControl(this.dialogData.members?.map(m => m.userId) || [] as string[]),
  })
  
  updateSelectedUsers(users: PortalUser[]){
    this.form.controls.members.setValue(users.map(u => u.userId));
  }
  save(){
    const data = {
      id: this.form.controls.groupId.value,
      groupName: this.form.controls.groupName.value,
      members: this.form.controls.members.value
    }
    this.dialogRef.close({data});
  }
  close(){
    this.dialogRef.close();
  }
 }
