import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { StreamComponent } from "../stream/stream.component";

@Component({
  selector: 'app-home',
  imports: [MatIconModule, StreamComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
