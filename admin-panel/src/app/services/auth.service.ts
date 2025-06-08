import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private loggedIn = signal<boolean>(this.validateToken());

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  login() {
    localStorage.setItem('token', '123456');
    this.loggedIn.set(true);
  }

  logout() {
    localStorage.removeItem('token')
    this.loggedIn.set(false);
  }

  validateToken(): boolean {
    return !!localStorage.getItem('token');
  }

}
