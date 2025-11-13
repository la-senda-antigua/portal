import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestManagerService } from './request-manager.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private requestManager: RequestManagerService, private router: Router) { }

  logout() {
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
    this.startGoogleLoginRedirect();
  }

  validateToken(): Observable<boolean> {
    return this.requestManager
      .get('/Auth/validate-token')
      .pipe(
        map((res: any) => {
          const roles = res?.user?.roles || [];
          localStorage.setItem('user-roles', JSON.stringify(roles));
          return true;
        }),
        catchError(() => of(false))
      );
  }

  hasRole(...roles: string[]): boolean {
    const userRoles = JSON.parse(localStorage.getItem('user-roles') || '[]') as string[];
    return roles.some(r => userRoles.includes(r));
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
          localStorage.setItem('refresh-token', response.refreshToken!);
          return true;
        }),
        catchError(() => of(false))
      );
  }
}
