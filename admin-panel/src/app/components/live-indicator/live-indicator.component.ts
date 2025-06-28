import { Component, effect, input, viewChild } from '@angular/core';
import { MatRipple, MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-live-indicator',
  imports: [MatRippleModule],
  templateUrl: './live-indicator.component.html',
  styleUrl: './live-indicator.component.scss',
})
export class LiveIndicatorComponent {
  readonly ripple = viewChild<MatRipple>(MatRipple);
  readonly state = input<'offline' | 'live' | 'connecting'>('offline');
  private _interval: any = null;
  constructor() {
    effect(() => {
      if (this.state() === 'live') {
        if (this._interval) return;
        this._interval = setInterval(() => {
          this.ripple()?.launch({
            persistent: false,
            centered: true,
            radius: 100,
            color: 'rgba(255, 0, 0, 0.5)',
          });
        }, 1000);
      } else {
        if (this._interval) {
          clearInterval(this._interval);
          this._interval = null;
        }
      }
    });
  }
}
