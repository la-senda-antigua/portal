import { Component, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-stream',
  imports: [MatIcon, MatButtonModule],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent {

  isOnline: boolean = false;

  toggleLive() {
    this.isOnline = !this.isOnline;
  }

  getButtonText(): string {
    return this.isOnline ? 'Go Off' : 'Go Live';
  }

}
