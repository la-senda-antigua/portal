import { effect, Inject, inject, Injectable, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { RadioBarComponent } from '../radio-bar/radio-bar.component';
import { RadioDialogComponent } from './radio-dialog.component';
import { DOCUMENT, TitleCasePipe } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { RadioTrackInfo } from 'src/app/models/radio-track-info.model';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class RadioService {
  readonly playState = signal<'playing' | 'paused' | 'loading'>('paused');
  readonly volumeValue = signal(50);
  readonly currentTrack = signal<RadioTrackInfo>({
    title: '',
    artist: '',
    album: '',
  });

  private audio = new Audio('https://play10.tikast.com/proxy/lasenda?mp=/stream');
  private readonly matDialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly titleService = inject(Title);
  private readonly titlecasePipe = new TitleCasePipe();
  private radioDialog?: MatDialogRef<RadioDialogComponent>;
  private radioBar?: MatSnackBarRef<RadioBarComponent>;
  private hubConnection: signalR.HubConnection;
  private baseUrl = environment.apiUrl;

  constructor(@Inject(DOCUMENT) private document: Document) {
    effect(() => {
      const track = this.currentTrack();
      if (track.title && track.artist) {
        this.titleService.setTitle(`${track.title} - ${track.artist} | La Senda`);
      }
    });

    effect(() => {
      this.audio.volume = this.volumeValue() / 100;
    });

    this.audio.addEventListener('playing', () => this.playState.set('playing'));
    this.audio.addEventListener('pause', () => this.playState.set('paused'));
    this.audio.addEventListener('waiting', () => this.playState.set('loading'));
    this.audio.addEventListener('error', () => {
      this.playState.set('paused');
      console.error('Error on audio stream');
    });

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.baseUrl + '/radio-info-hub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('track-changed', (trackInfo: RadioTrackInfo) => {
      const formattedTrackInfo: RadioTrackInfo = {
        title: this.titlecasePipe.transform(trackInfo.title),
        artist: this.titlecasePipe.transform(trackInfo.artist),
        album: this.titlecasePipe.transform(trackInfo.album),
      };
      this.currentTrack.set(formattedTrackInfo);
    });
  }

  togglePlay() {
    if (this.playState() === 'playing') {
      this.audio.pause();
    } else {
      this.playState.set('loading');
      this.audio.play().catch(err => {
        console.error("Error on player:", err);
        this.playState.set('paused');
      });
    }
  }

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
      panelClass: 'radio-dialog-shadow',
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

  startHubConnection() {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }
    this.hubConnection
      .start()
      .then(() => console.log('RadioInfoHub Connection started'))
      .catch((err) => console.error('Error while starting connection: ' + err));
  }

  stopHubConnection() {
    this.hubConnection
      .stop()
      .then(() => console.log('RadioInfoHub Connection stopped'))
      .catch((err) => console.error('Error while stopping connection: ' + err));
  }

  stopRadio() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.stopHubConnection();
  }
}
