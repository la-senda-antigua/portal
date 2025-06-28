import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './auth.guard';
import { ChurchServicesComponent } from './components/church-services/church-services.component';
import { BibleCoursesComponent } from './components/bible-courses/bible-courses.component';
import { StreamComponent } from './components/stream/stream.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { PreachersComponent } from './components/preachers/preachers.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'services',
    component: ChurchServicesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'preachers',
    component: PreachersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'courses',
    component: BibleCoursesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'stream',
    component: StreamComponent,
    canActivate: [AuthGuard]
  },
];
