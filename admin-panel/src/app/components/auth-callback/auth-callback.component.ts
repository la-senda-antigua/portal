import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.scss',
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken!);
      this.router.navigate(['/']); 
    } else {
      console.error('No se recibió el token');
      this.router.navigate(['/login']); 
    }
  }
}
