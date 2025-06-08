import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (this.authService.validateToken()) {
      // Si está logueado, permite acceso
      return true;
    } else {
      // Si no está logueado, redirige al login
      this.router.navigate(['/login']);
      return false;
    }
  }

}
