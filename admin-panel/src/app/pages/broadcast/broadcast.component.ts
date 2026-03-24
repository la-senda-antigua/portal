import { Component } from '@angular/core';
import { StreamComponent } from '../../components/stream/stream.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-broadcast',
  imports: [StreamComponent, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './broadcast.component.html',
  styleUrl: './broadcast.component.scss'
})
export class BroadcastComponent {

}
