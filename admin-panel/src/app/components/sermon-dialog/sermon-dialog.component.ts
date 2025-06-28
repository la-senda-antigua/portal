import { Component, Inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Sermon } from '../../models/Sermon';
import { Preacher } from '../../models/Preacher';
import { SermonsService } from '../../services/sermons.service';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-sermon-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, MatOption, MatSelectModule, CommonModule, FormsModule
  ],
  templateUrl: './sermon-dialog.component.html',
  styleUrls: ['./sermon-dialog.component.scss'],
})
export class SermonDialogComponent implements OnInit {
  form: FormGroup;
  preachers: Preacher[] = [];  
  preacherFilter: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SermonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Sermon,
    private sermonsService: SermonsService
  ) {
    this.form = this.fb.group({
      title: [data?.title || '', Validators.required],
      date: [data?.date || '', Validators.required],
      cover: [data?.cover || '', Validators.required],
      videoPath: [data?.videoPath || '', Validators.required],
      preacherId: [data?.preacher?.id || '', Validators.required],
    });

    if (data) {
      const formattedDate = new Date(data.date).toISOString().substring(0, 10);
      this.form.patchValue({
        ...data,
        date: formattedDate,
      });
    }
  }

  ngOnInit(): void {
    this.sermonsService.getAllPreachers().subscribe((preachers) => {
      this.preachers = preachers;      
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
