import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TableViewFormData } from '../table-view/table-view.component';
import { PreachersService } from '../../services/preachers.service';
import { PlaylistsService } from '../../services/playlists.service';

export interface VideoFormData extends TableViewFormData {
  data: {
    id?: number;
    title: string;
    date: Date;
    cover: string;
    videoUrl: string;
    preacherId?: number;
    preacherName?: string;
    playlistId?: string;
  };
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
  readonly preachersService = inject(PreachersService);
  readonly playlistService = inject(PlaylistsService);
  readonly datePipe = inject(DatePipe);

  readonly videoForm: FormGroup<{
    title: FormControl<string | null>;
    date: FormControl<string | null>;
    cover: FormControl<string | null>;
    videoUrl: FormControl<string | null>;
    playlistId: FormControl<string | null>;
    preacher?: FormGroup<{
      preacherId: FormControl<number | null>;
      preacherName: FormControl<string | null>;
    }>;
  }> = new FormGroup({
    title: new FormControl(this.formData.data.title, Validators.required),
    date: new FormControl(
      this.datePipe.transform(
        this.formData.data.date ?? new Date(),
        'yyyy-MM-dd'
      ),
      Validators.required
    ),
    cover: new FormControl(this.formData.data.cover, Validators.required),
    videoUrl: new FormControl(this.formData.data.videoUrl, Validators.required),
    playlistId: new FormControl(this.formData.data.playlistId ?? null),
  });

  readonly preacherList = toSignal(this.preachersService.getAll());
  readonly playlists = toSignal(this.playlistService.getAll());

  constructor() {
    if (this.formData.type !== 'gallery') {
      const preacherIdControl = new FormControl(
        this.formData.data.preacherId ?? null,
        Validators.required
      );
      const preacherNameControl = new FormControl(
        this.formData.data.preacherName ?? null,
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
      mode: this.formData.mode,
      type: this.formData.type,
      data: {
        id: this.formData.data.id,
        title: this.videoForm.controls.title.value!,
        date: new Date(this.videoForm.controls.date.value!),
        cover: this.videoForm.controls.cover.value!,
        videoUrl: this.videoForm.controls.videoUrl.value!,
        playlistId: this.videoForm.controls.playlistId.value ?? undefined,
        preacherId:
          this.videoForm.controls.preacher?.controls?.preacherId.value ??
          undefined,
        preacherName:
          this.videoForm.controls.preacher?.controls?.preacherName.value ??
          undefined,
      },
    };
  }
}
