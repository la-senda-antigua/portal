import { Component } from '@angular/core';
import { LogoutComponent } from '../../components/logout/logout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-media-menu',
  imports: [MatIconModule, MatButtonModule, LogoutComponent, RouterLink],
  templateUrl: './media-menu.component.html',
  styleUrl: './media-menu.component.scss'
})
export class MediaMenuComponent {

}
