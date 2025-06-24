import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, firstValueFrom, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  logout() {
    localStorage.removeItem('token');
  }

  validateToken(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return Promise.resolve(false);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return firstValueFrom(
      this.http
        .get(`${environment.apiBaseUrl}/api/Auth/validate-token`, { headers })
        .pipe(
          map(() => {
            return true;
          }),
          catchError(() => {
            
            return of(false);
          })
        )
    );
  }

  startGoogleLoginRedirect() {    
    window.location.href = `${environment.apiBaseUrl}/api/Auth/google-login`;
  }
}
