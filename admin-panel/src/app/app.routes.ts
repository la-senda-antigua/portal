import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { StreamComponent } from './components/stream/stream.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { PreachersComponent } from './pages/preachers/preachers.component';
import { PlaylistsViewComponent } from './pages/playlists-view/playlists-view.component';
import { HomeComponent } from './pages/home/home.component';
import { ChurchServicesComponent } from './pages/church-services/church-services.component';
import { BibleCoursesComponent } from './pages/bible-courses/bible-courses.component';
import { GalleryVideosComponent } from './pages/gallery-videos/gallery-videos.component';

export const routes: Routes = [
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'services',
    component: ChurchServicesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'preachers',
    component: PreachersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'courses',
    component: BibleCoursesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'gallery',
    component: GalleryVideosComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'stream',
    component: StreamComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'playlists',
    component: PlaylistsViewComponent,
    canActivate: [AuthGuard],
  },
];
