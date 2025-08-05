import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StreamComponent } from '../../components/stream/stream.component';

@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule, StreamComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
