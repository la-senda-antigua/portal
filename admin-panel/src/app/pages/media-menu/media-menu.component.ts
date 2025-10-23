import { Component } from '@angular/core';
import { LogoutComponent } from '../../components/logout/logout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-media-menu',
  imports: [MatIconModule, MatButtonModule, LogoutComponent],
  templateUrl: './media-menu.component.html',
  styleUrl: './media-menu.component.scss'
})
export class MediaMenuComponent {

}
