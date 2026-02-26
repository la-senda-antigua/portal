import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserRole } from './models/PortalUser';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as UserRole[];
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasAccess = requiredRoles.some(role => this.authService.hasRole(role));
    if (!hasAccess) {      
      this.router.navigate(['/']);
    }

    return hasAccess;
  }
}
