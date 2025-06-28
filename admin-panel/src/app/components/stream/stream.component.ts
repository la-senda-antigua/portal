import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HoursMinsSecsPipe } from '../../pipes/hours-mins-secs.pipe';
import { GoliveService } from '../../services/golive.service';
import { LiveIndicatorComponent } from '../live-indicator/live-indicator.component';

@Component({
  selector: 'app-stream',
  imports: [
    MatIcon,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    HoursMinsSecsPipe,
    LiveIndicatorComponent
  ],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss',
})
export class StreamComponent implements OnInit {
  readonly state = signal<'offline' | 'live' | 'connecting'>('offline');
  readonly timeLeft = signal<number | null>(null);
  readonly goLiveService = inject(GoliveService);
  url = '';
  private _countdownInterval: any = null;

  ngOnInit() {
    this.goLiveService.getLiveStatus().subscribe({
      next: (response) => {
        if (!response.isOn) {
          return;
        }
        this.state.set('live');
        this.url = response.videoURL ?? '';
        this.timeLeft.set(new Date(response.endTime).getTime() - Date.now());
        this.startCountdown();
      },
      error: (error) => {
        console.error('Error fetching live status:', error);
      },
    });
  }

  goLive() {
    this.state.set('connecting');
    this.goLiveService.goLive(this.url).subscribe({
      next: (response) => {
        if (!response.isOn) {
          this.state.set('offline');
          this.timeLeft.set(null);
          return;
        }
        this.state.set('live');
        this.url = response.videoURL ?? '';
        this.timeLeft.set(new Date(response.endTime).getTime() - Date.now());
        this.startCountdown();
      },
      error: (error) => {
        console.error('Error starting live stream:', error);
        this.state.set('offline');
      },
    });
  }

  goOffline() {
    this.state.set('connecting');
    this.goLiveService.goOffline().subscribe({
      next: () => {
        this.state.set('offline');
        this.timeLeft.set(null);
      },
      error: (error) => {
        console.error('Error disconnecting live service:', error);
        this.state.set('live');
      },
    });
  }

  add30Minutes() {
    this.state.set('connecting');
    this.goLiveService.add30Minutes().subscribe({
      next: (response) => {
        if (!response.isOn) {
          this.state.set('offline');
          this.timeLeft.set(null);
          return;
        }
        this.state.set('live');
        if (this._countdownInterval) {
          clearInterval(this._countdownInterval);
        }
        this.timeLeft.set(new Date(response.endTime).getTime() - Date.now());
        this.startCountdown();
      },
      error: (error) => {
        console.error('Error adding 30 minutes:', error);
      },
    });
  }

  private startCountdown() {
    this._countdownInterval = setInterval(() => {
      const currentTimeLeft = this.timeLeft();
      if (currentTimeLeft !== null && currentTimeLeft > 0) {
        this.timeLeft.set(currentTimeLeft - 1000);
      } else {
        clearInterval(this._countdownInterval);
        this.state.set('offline');
        this.timeLeft.set(null);
      }
    }, 1000);
  }
}
