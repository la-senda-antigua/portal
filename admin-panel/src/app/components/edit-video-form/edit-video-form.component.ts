import { Component, inject, Inject, input, OnInit } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Sermon } from '../../models/Sermon';
import { Preacher } from '../../models/Preacher';
import { VideoRecordingsService } from '../../services/video-recordings.service';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatDivider } from '@angular/material/divider';

export interface VideoFormData {
  id?: number;
  videoType: 'sermon' | 'biblecourse' | 'gallery';
  mode: 'add' | 'edit';
  title: string;
  date: Date;
  cover: string;
  videoUrl: string;
  preacherId?: number;
  preacherName?: string;
}

@Component({
  selector: 'app-edit-video-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOption,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatCardModule,
    TitleCasePipe,
  ],
  templateUrl: './edit-video-form.component.html',
  styleUrls: ['./edit-video-form.component.scss'],
  providers: [DatePipe],
})
export class EditVideoFormComponent {
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditVideoFormComponent>);
  readonly formData = inject<VideoFormData>(MAT_DIALOG_DATA);
  readonly videoService = inject(VideoRecordingsService);
  readonly datePipe = inject(DatePipe);

  readonly videoForm: FormGroup<{
    title: FormControl<string | null>;
    date: FormControl<string | null>;
    cover: FormControl<string | null>;
    videoUrl: FormControl<string | null>;
    preacher?: FormGroup<{
      preacherId: FormControl<number | null>;
      preacherName: FormControl<string | null>;
    }>;
  }> = new FormGroup({
    title: new FormControl(this.formData.title, Validators.required),
    date: new FormControl(
      this.datePipe.transform(this.formData.date ?? new Date(), 'yyyy-MM-dd'),
      Validators.required
    ),
    cover: new FormControl(this.formData.cover, Validators.required),
    videoUrl: new FormControl(this.formData.videoUrl, Validators.required),
  });

  preacherList = toSignal(this.videoService.getAllPreachers());

  constructor() {
    if (this.formData.videoType !== 'gallery') {
      const preacherIdControl = new FormControl(
        this.formData.preacherId ?? null,
        Validators.required
      );
      const preacherNameControl = new FormControl(
        this.formData.preacherName ?? null,
        Validators.required
      );
      preacherIdControl.valueChanges
        .pipe(takeUntilDestroyed())
        .subscribe((id) => {
          const name =
            this.preacherList()?.find((p) => p.id === id)?.name || '';
          preacherNameControl.patchValue(name);
        });

      this.videoForm.addControl(
        'preacher',
        new FormGroup({
          preacherId: preacherIdControl,
          preacherName: preacherNameControl,
        })
      );
    }
  }

  save() {
    this.dialogRef.close(this.toVideoFormData());
  }

  close() {
    this.dialogRef.close();
  }

  private toVideoFormData(): VideoFormData {
    if (this.videoForm.invalid) {
      return this.formData;
    }
    return {
      id: this.formData.id,
      mode: this.formData.mode,
      videoType: this.formData.videoType,
      title: this.videoForm.controls.title.value!,
      date: new Date(this.videoForm.controls.date.value!),
      cover: this.videoForm.controls.cover.value!,
      videoUrl: this.videoForm.controls.videoUrl.value!,
      preacherId:
        this.videoForm.controls.preacher?.controls?.preacherId.value ??
        undefined,
      preacherName:
        this.videoForm.controls.preacher?.controls?.preacherName.value ??
        undefined,
    };
  }
}
