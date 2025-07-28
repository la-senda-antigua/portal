import { Component, Inject,  } from '@angular/core';
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
import { VideosService } from '../../services/videos.service';
import { MatSelectModule } from '@angular/material/select';
import { Gallery } from '../../models/Gallery';


@Component({
  selector: 'app-gallery-dialog',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, MatSelectModule, CommonModule, FormsModule],
  templateUrl: './gallery-dialog.component.html',
  styleUrl: './gallery-dialog.component.scss'
})
export class GalleryDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GalleryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Gallery,
    private videoService: VideosService
  ) {
    this.form = this.fb.group({
      title: [data?.title || '', Validators.required],
      date: [data?.date || '', Validators.required],
      cover: [data?.cover || '', Validators.required],
      videoPath: [data?.videoPath || '', Validators.required],
    });

    if (data) {
      const formattedDate = new Date(data.date).toISOString().substring(0, 10);
      this.form.patchValue({
        ...data,
        date: formattedDate,
      });
    }
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
