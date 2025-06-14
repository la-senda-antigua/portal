import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './auth.guard';
import { ChurchServicesComponent } from './components/church-services/church-services.component';
import { BibleCoursesComponent } from './components/bible-courses/bible-courses.component';
import { StreamComponent } from './components/stream/stream.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
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
