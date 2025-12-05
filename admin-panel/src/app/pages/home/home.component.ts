import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LogoutComponent } from "../../components/logout/logout.component";
import { AuthService } from '../../services/auth.service';
import { DateTimePickerComponent } from "../../components/date-time-picker/date-time-picker.component";

@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule, LogoutComponent, DateTimePickerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(public authService: AuthService) {


  }
}
