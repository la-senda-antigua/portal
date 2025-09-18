import {
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { RadioService } from '../radio-dialog/radio.service';

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
  }

  ngOnInit(): void {
    this.radioService.startHubConnection();
  }

  expand() {
    this.radioService.popUpRadio();
  }
}
