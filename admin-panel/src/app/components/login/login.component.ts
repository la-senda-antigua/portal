import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [],

})
export class LoginComponent {

  constructor(private authService: AuthService, private router: Router) {
  }

  login() {
    this.authService.login()
    this.router.navigate([''])
  }
}
