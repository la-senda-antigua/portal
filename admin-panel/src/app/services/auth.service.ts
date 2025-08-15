import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestManagerService } from './request-manager.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private requestManager: RequestManagerService) { }

  logout() {
    localStorage.removeItem('token');
  }

  validateToken(): Observable<boolean> {
    return this.requestManager
      .get('/Auth/validate-token')
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  startGoogleLoginRedirect() {
    const baseUrl = `${window.location.protocol}//${window.location.host}/auth/callback`
    const callbackUrl = encodeURIComponent(baseUrl);
    window.location.href = `${environment.apiBaseUrl}/Auth/google-login?callbackUrl=${callbackUrl}`;
  }

  refreshToken(): Observable<boolean> {
    return this.requestManager
      .get('/Auth/refresh-token')
      .pipe(
        map((response: any) => {
          localStorage.setItem('access-token', response.accesToken);
          localStorage.setItem('refreshToken', response.refreshToken!);
          return true;
        }),
        catchError(() => of(false))
      );
  }
}
