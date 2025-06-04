import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = signal(false);

  isLoggedIn = this.loggedIn.asReadonly();

  login() {
    this.loggedIn.set(true);
  }

  logout() {
    this.loggedIn.set(false);
  }
}
