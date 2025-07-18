import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lsa-radio-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatSliderModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './radio-dialog.component.html',
  styleUrl: './radio-dialog.component.scss',
})
export class RadioDialogComponent {
  readonly snackBar = inject(MatSnackBar);
  readonly isVolumeUp = signal(true);
  readonly playState = signal<'playing' | 'paused'>('paused');
  readonly volumeValue = signal(50);

  readonly audioElement = viewChild<ElementRef>('audioElement');
  readonly audioContext = new AudioContext();
  readonly audioTrack = computed(() => {
    if (this.audioElement()?.nativeElement) {
      return this.audioContext.createMediaElementSource(this.audioElement()?.nativeElement);
    }
    return null;
  });

  constructor(private dialogRef: MatDialogRef<RadioDialogComponent>) {
    effect(() => {
      if (this.audioTrack() != null) {
        this.audioTrack()?.connect(this.audioContext.destination);
      }
    });
  }

  togglePlay() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (this.playState() === 'playing') {
      this.playState.set('paused');
      this.audioElement()?.nativeElement.pause();
    } else {
      this.playState.set('playing');
      this.audioElement()?.nativeElement.play();
    }
  }

  hideDialog() {
    this.dialogRef.close();

    // this.snackBar.openFromComponent(LiveServiceSnackbarComponent, {
    //   data: { message },
    //   horizontalPosition: 'start',
    // });
  }
}
