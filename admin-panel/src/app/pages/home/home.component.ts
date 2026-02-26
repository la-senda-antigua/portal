import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LogoutComponent } from '../../components/logout/logout.component';
import { AuthService } from '../../services/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { UserRole } from '../../models/PortalUser';

@Component({
  selector: 'app-home',
  imports: [
    MatIconModule,
    MatButtonModule,
    LogoutComponent,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  userRoles = UserRole;
  constructor(public authService: AuthService) {}
}
