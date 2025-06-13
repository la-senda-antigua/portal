import { Component, input, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-stream',
  imports: [MatIcon, MatButtonModule, FormsModule, MatInputModule],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent {

  isOnline: boolean = false;
  url: string ='';

  toggleLive() {
    this.isOnline = !this.isOnline;
  }

  getButtonText(): string {
    return this.isOnline ? 'Go Off' : 'Go Live';
  }

  
}
