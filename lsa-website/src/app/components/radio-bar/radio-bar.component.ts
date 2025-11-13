import {
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { RadioService } from '../radio-dialog/radio.service';
import { RadioTrackInfo } from 'src/app/models/radio-track-info.model';

@Component({
  selector: 'lsa-radio-bar',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './radio-bar.component.html',
  styleUrl: './radio-bar.component.scss',
})
export class RadioBarComponent implements OnInit {
  readonly radioService = inject(RadioService);
  readonly snackBarRef = inject(MatSnackBarRef<RadioBarComponent>);
  readonly matDialog = inject(MatDialog);
  readonly playState = this.radioService.playState;
  readonly volumeValue = this.radioService.volumeValue;
  readonly audioElement = viewChild<ElementRef>('audioElement');
  readonly currentTrack = this.radioService.currentTrack;
  readonly resetCurrentTrack = signal(false);
  private lastTrack: RadioTrackInfo | undefined;
  readonly streamInfoElement = viewChild<ElementRef>('streaminfo');

  constructor() {
    effect(() => {
      if (this.audioElement()?.nativeElement) {
        const volume = this.volumeValue() / 100;
        this.audioElement()!.nativeElement.volume = volume;
        if (this.playState() === 'playing') {
          this.audioElement()!.nativeElement.play();
        }
      }
    });
    effect(() => {
      const infoElement = this.streamInfoElement()
        ?.nativeElement as HTMLSpanElement;
      if (infoElement) {
        infoElement.style.setProperty(
          '--carrousel-span-width',
          `${infoElement.offsetWidth}px`
        );
      }
    });
    effect(() => {
      const trackChanged = this.currentTrack();
      if (
        trackChanged.title !== this.lastTrack?.title &&
        trackChanged.artist !== this.lastTrack?.artist
      ) {
        this.lastTrack = trackChanged;
        untracked(() => {
          this.resetCurrentTrack.set(true);
          setTimeout(() => this.resetCurrentTrack.set(false), 500);
        });
      }
    });
  }

  ngOnInit(): void {
    this.radioService.startHubConnection();
  }

  expand() {
    this.radioService.popUpRadio();
  }
}
