import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, } from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { PreachersService } from '../../services/preachers.service';
import { TableViewFormData } from '../table-view/table-view.component';

export interface UserFormData extends TableViewFormData {
  data: {
    id?: number;
    username: string;
    role?: string;
    calendars?: any[];
  };
}

@Component({
  selector: 'app-edit-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TitleCasePipe
  ],
  templateUrl: './edit-user-form.component.html',
  styleUrl: './edit-user-form.component.scss',
  providers: [DatePipe],
})
export class EditUserFormComponent {

    readonly formBuilder = inject(FormBuilder);
    readonly dialogRef = inject(MatDialogRef<EditUserFormComponent>);
    readonly formData = inject<UserFormData>(MAT_DIALOG_DATA);
    readonly preachersService = inject(PreachersService);
    readonly datePipe = inject(DatePipe);
    readonly dialog = inject(MatDialog);

}
