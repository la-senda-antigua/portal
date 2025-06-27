import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestManagerService } from './request-manager.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private requestManager: RequestManagerService) {}

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
    window.location.href = `${environment.apiBaseUrl}/Auth/google-login`;
  }
}
