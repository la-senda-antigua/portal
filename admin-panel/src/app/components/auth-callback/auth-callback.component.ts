import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.scss',
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access-token');
    const refreshToken = params.get('refreshToken');
    if (accessToken) {
      localStorage.setItem('access-token', accessToken);
      localStorage.setItem('refresh-token', refreshToken!);
      this.router.navigate(['/']);
    } else {
      this.authService.startGoogleLoginRedirect()
    }
  }
}
