import { Inject, inject, Injectable, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { RadioBarComponent } from '../radio-bar/radio-bar.component';
import { RadioDialogComponent } from './radio-dialog.component';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RadioService {
  readonly playState = signal<'playing' | 'paused' | 'loading'>('paused');
  readonly volumeValue = signal(50);
  private readonly matDialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private radioDialog?: MatDialogRef<RadioDialogComponent>;
  private radioBar?: MatSnackBarRef<RadioBarComponent>;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  popUpRadio() {
    if (this.radioBar) {
      this.radioBar.dismiss();
    }
    if (this.radioDialog) {
      this.radioDialog.close();
    }
    this.radioDialog = this.matDialog.open(RadioDialogComponent, {
      disableClose: true,
      hasBackdrop: false,
      position: { bottom: '20px', right: '20px' },
    });
    this.radioDialog.afterClosed().subscribe(() => {
      this.radioDialog = undefined;
    });
  }

  minimizeRadio() {
    if (this.radioDialog) {
      this.radioDialog.close();
    }
    if (this.radioBar) {
      this.radioBar.dismiss();
    }
    this.radioBar = this.snackBar.openFromComponent(RadioBarComponent, {
      horizontalPosition: 'end',
    });
    this.radioBar.afterDismissed().subscribe(() => {
      this.radioBar = undefined;
    });
  }

  insertRadioScript() {
    if (this.document.getElementById('cc_streaminfo')) {
      this.document.body.removeChild(
        this.document.getElementById('cc_streaminfo')!
      );
    }
    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'cc_streaminfo';
    script.src = 'http://radio45.virtualtronics.com:2199/system/streaminfo.js';
    this.document.body.appendChild(script);
  }
}
