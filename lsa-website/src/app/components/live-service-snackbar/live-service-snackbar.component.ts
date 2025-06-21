import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { LsaServiceHubService } from 'src/app/lsa-service-hub/lsa-service-hub.service';
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
  readonly message = signal(this.data.message);

  expand() {
    this.snackBarRef.dismiss();
    const { videoUrl } = this.liveService.liveServiceState();

    this.matDialog.open(LiveServiceDialogComponent, {
      data: { videoUrl },
      closeOnNavigation: false,
      disableClose: true,
      hasBackdrop: true,
    });
  }
}
