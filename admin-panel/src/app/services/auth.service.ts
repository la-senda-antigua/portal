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

  startGoogleLogin() {
    const popup = window.open(
      'https://testing-api.iglesialasendaantigua.com/api/Auth/google-login',
      '_blank',
      'width=500,height=600'
    );

    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        if (event.origin !== 'https://testing-api.iglesialasendaantigua.com') return;

        const { token, refreshToken } = event.data;
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          this.loggedIn.set(true);
          window.removeEventListener('message', listener);
          resolve(true);
        } else {
          reject('No token');
        }
      };

      window.addEventListener('message', listener);
    });
  }

}
