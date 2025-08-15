import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate() {
    return this.authService.validateToken().pipe(
      switchMap(valid => {
        if (valid) {return of(true);}

        // Token no válido, intento refrescar
        return this.authService.refreshToken().pipe(
          tap(refreshValid => {
            if (!refreshValid) {
              this.authService.startGoogleLoginRedirect();
            }
          }),
          map(refreshValid => refreshValid)
        );
      })
    );
  }
}
