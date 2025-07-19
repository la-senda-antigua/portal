import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  Inject,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject(MatDialogRef<RadioDialogComponent>);
  readonly isVolumeUp = signal(true);
  readonly playState = signal<'playing' | 'paused'>('paused');
  readonly volumeValue = signal(50);
  readonly volumeWhenMute = signal(50);
  readonly audioElement = viewChild<ElementRef>('audioElement');
  
  constructor(@Inject(DOCUMENT) private document: Document) {
    effect(() => {
      const volume = this.volumeValue() / 100;
      if (this.audioElement()?.nativeElement) {
        this.audioElement()!.nativeElement.volume = volume;
      }
      if (volume > 0 && !this.isVolumeUp()) {
        this.isVolumeUp.set(true);
      }
    });
  }

  ngOnInit(): void {
    // don't load the script if it already exists
    if (this.document.getElementById('cc_streaminfo')) {
      return;
    }
    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'cc_streaminfo';
    script.src = 'http://radio45.virtualtronics.com:2199/system/streaminfo.js';
    script.async = true;
    this.document.body.appendChild(script);
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

  close(){
    this.dialogRef.close();
  }

  minimize() {
    this.dialogRef.close();

    // this.snackBar.openFromComponent(LiveServiceSnackbarComponent, {
    //   data: { message },
    //   horizontalPosition: 'start',
    // });
  }
}
