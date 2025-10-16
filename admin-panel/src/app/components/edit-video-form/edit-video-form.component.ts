import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { VideoPlaylist } from '../../models/VideoPlaylist';
import { PlaylistsService } from '../../services/playlists.service';
import { PreachersService } from '../../services/preachers.service';
import { EditIdNameFormComponent } from '../edit-id-name-form/edit-id-name-form.component';
import { TableViewFormData } from '../table-view/table-view.component';

export interface VideoFormData extends TableViewFormData {
  data: {
    id?: number;
    title: string;
    date: Date;
    cover: File | string;
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
    MatIconModule,
    MatProgressSpinnerModule,
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
  readonly dialog = inject(MatDialog);

  readonly videoForm: FormGroup<{
    title: FormControl<string | null>;
    date: FormControl<string | null>;
    cover: FormControl<File | string | null>;  
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
  readonly playlists = signal<VideoPlaylist[]>([]);
  readonly didAddingPlaylistFail = signal(false);
  readonly addingPlaylist = signal<boolean>(false);
  fileName: string = '';

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
    this.refreshPlaylists();
  }

  save() {
    this.dialogRef.close(this.toVideoFormData());
  }

  close() {
    this.dialogRef.close();
  }

  addPlaylistClick() {
    const addPlaylistDialog = this.dialog.open(EditIdNameFormComponent, {
      data: {
        mode: 'add',
        type: this.formData.type,
        data: {},
      },
    });
    addPlaylistDialog.afterClosed().subscribe((form) => {
      if (form != null) {
        this.addingPlaylist.set(true);
        const playlist = { name: form.data.name } as VideoPlaylist;
        this.playlistService.add(playlist).subscribe({
          next: (pl) => {
            this.videoForm.controls.playlistId.patchValue(pl.id!);
            this.refreshPlaylists();
            this.addingPlaylist.set(false);
          },
          error: (err) => this.handleAddPlaylistError(err),
        });
      }
    });
  }

  private refreshPlaylists() {
    this.playlistService
      .getAll()
      .subscribe((playlists) => this.playlists.set(playlists.sortByKey('name')));
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

  private handleAddPlaylistError(err: Error) {
    console.error(err);
    this.addingPlaylist.set(false);
    this.didAddingPlaylistFail.set(true);
    setTimeout(() => {
      this.didAddingPlaylistFail.set(false);
    }, 4000);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.videoForm.controls.cover.setValue(file);
    }
  }

}
