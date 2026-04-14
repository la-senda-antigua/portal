import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { LsaServiceHubService } from 'src/app/services/lsa-service-hub.service';
import { LiveServiceDialogComponent } from '../live-service-dialog/live-service-dialog.component';

@Component({
  selector: 'lsa-live-service-snackbar',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './live-service-snackbar.component.html',
  styleUrl: './live-service-snackbar.component.scss',
})
export class LiveServiceSnackbarComponent {
  private readonly data = inject<{ message: string }>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject(
    MatSnackBarRef<LiveServiceSnackbarComponent>
  );
  private readonly matDialog = inject(MatDialog);
  private readonly liveService = inject(LsaServiceHubService);
  readonly message = signal(this.decodeHtmlEntities(this.data.message));

  private decodeHtmlEntities(text: string): string {
    if (!text) return '';
    const parser = new DOMParser();
    const dom = parser.parseFromString(text, 'text/html');
    return dom.documentElement.textContent || text;
  }

  expand() {
    this.snackBarRef.dismiss();
    const { videoUrl } = this.liveService.liveServiceState();

    this.matDialog.open(LiveServiceDialogComponent, {
      id: 'lsa-live-dialog',
      data: { videoUrl },
      closeOnNavigation: false,
      disableClose: true,
      hasBackdrop: true,
    });
  }
}
