import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  SecurityContext,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppConfigService } from 'src/app/app-config/app-config.service';
import { LiveBroadcastConfig } from 'src/app/models/app.config.models';
import { LiveServiceSnackbarComponent } from '../live-service-snackbar/live-service-snackbar.component';

@Component({
  selector: 'lsa-live-service-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './live-service-dialog.component.html',
  styleUrl: './live-service-dialog.component.scss',
})
export class LiveServiceDialogComponent implements OnInit {
  readonly matDialogData = inject<{ videoUrl: string }>(MAT_DIALOG_DATA);
  readonly videoUrl = signal<SafeResourceUrl | undefined>(undefined);
  readonly liveConfig = signal<LiveBroadcastConfig | undefined>(undefined);
  readonly httpRegex =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  readonly textMessage = signal<string | null>(null);
  readonly snackBar = inject(MatSnackBar);

  constructor(
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<LiveServiceDialogComponent>,
    appConfigService: AppConfigService
  ) {
    this.liveConfig.set(appConfigService.appConfig()?.live);
  }

  ngOnInit(): void {
    const isVideoUrl = this.httpRegex.test(this.matDialogData.videoUrl);
    if (isVideoUrl) {
      this.videoUrl.set(
        this.sanitizer.bypassSecurityTrustResourceUrl(
          this.matDialogData.videoUrl
        )
      );
    } else {
      this.textMessage.set(
        this.sanitizer.sanitize(
          SecurityContext.HTML,
          this.matDialogData.videoUrl
        )
      );
    }
  }

  hideDialog() {
    this.dialogRef.close();
    const message = this.textMessage() ?? this.liveConfig()?.title;
    if (message) {
      this.snackBar.openFromComponent(LiveServiceSnackbarComponent, {
        data: { message },
        horizontalPosition: 'start',
      });
    }
  }
}
