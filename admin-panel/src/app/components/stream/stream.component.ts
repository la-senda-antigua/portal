import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HoursMinsSecsPipe } from '../../pipes/hours-mins-secs.pipe';

@Component({
  selector: 'app-stream',
  imports: [
    MatIcon,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    HoursMinsSecsPipe
  ],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss',
})
export class StreamComponent {
  readonly state = signal<'offline' | 'live' | 'connecting'>('offline');
  readonly timeLeft = signal<number | null>(null);
  url: string = '';

  toggleLive() {
    if (this.state() === 'live') {
      this.state.set('offline');
      return;
    }

    this.state.set('connecting');
    this.timeLeft.set(10000);
    setTimeout(() => {
      this.state.set('live');
      this.startCountdown();
    }, 1000);
  }

  private startCountdown() {
    const interval = setInterval(() => {
      const currentTimeLeft = this.timeLeft();
      if (currentTimeLeft !== null && currentTimeLeft > 0) {
        this.timeLeft.set(currentTimeLeft - 1000);
      } else {
        clearInterval(interval);
        this.toggleLive();
      }
    }, 1000);
  }
}
