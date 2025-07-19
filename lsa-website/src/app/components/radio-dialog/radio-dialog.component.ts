import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs';
import { RadioService } from './radio.service';

@Component({
  selector: 'lsa-radio-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
    MatSliderModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './radio-dialog.component.html',
  styleUrl: './radio-dialog.component.scss',
})
export class RadioDialogComponent implements OnInit {
  readonly radioService = inject(RadioService);
  readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject(MatDialogRef<RadioDialogComponent>);
  readonly isVolumeUp = signal(true);
  readonly playState = this.radioService.playState;
  readonly volumeValue = this.radioService.volumeValue;
  readonly volumeWhenMute = signal(50);
  readonly audioElement = viewChild<ElementRef>('audioElement');
  readonly breakpointObserver = inject(BreakpointObserver);
  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => result.matches))
  );

  constructor() {
    effect(() => {
      const volume = this.volumeValue() / 100;
      if (this.audioElement()?.nativeElement) {
        this.audioElement()!.nativeElement.volume = volume;
      }
      if (volume > 0 && !this.isVolumeUp()) {
        this.isVolumeUp.set(true);
      }
    });
    effect(() => {
      const audioElement = this.audioElement()
        ?.nativeElement as HTMLAudioElement;
      if (
        audioElement &&
        audioElement.paused &&
        this.playState() === 'playing'
      ) {
        audioElement.play();
      }
    });
  }

  ngOnInit(): void {
    this.radioService.insertRadioScript();
  }

  togglePlay() {
    if (this.playState() === 'playing') {
      this.playState.set('paused');
      this.audioElement()?.nativeElement.pause();
    } else {
      this.playState.set('playing');
      this.audioElement()?.nativeElement.play();
    }
  }

  toggleMute() {
    if (this.audioElement()?.nativeElement == undefined) {
      return;
    }
    this.isVolumeUp.set(!this.isVolumeUp());
    if (this.isVolumeUp()) {
      this.volumeValue.set(this.volumeWhenMute());
    } else {
      this.volumeWhenMute.set(this.volumeValue());
      this.volumeValue.set(0);
    }
  }

  close() {
    this.dialogRef.close();
  }

  minimize() {
    this.radioService.minimizeRadio();
  }
}
