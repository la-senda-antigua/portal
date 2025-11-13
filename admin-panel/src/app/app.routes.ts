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
import { PublicEventComponent } from './pages/public-event-list-view/public-event-list-view.component';
import { BroadcastComponent } from './pages/broadcast/broadcast.component';
import { MediaMenuComponent } from './pages/media-menu/media-menu.component';
import { RoleGuard } from './role.guard';
import { UsersPageComponent } from './pages/users-page/users-page.component';
import { CalendarsComponent } from './pages/calendars/calendars.component';
import { CalendarDetailsComponent } from './pages/calendar-details/calendar-details.component';

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
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'MediaManager'] }
  },
  {
    path: 'preachers',
    component: PreachersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'MediaManager'] }
  },
  {
    path: 'courses',
    component: BibleCoursesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'MediaManager'] }
  },
  {
    path: 'gallery',
    component: GalleryVideosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'MediaManager'] }
  },
  {
    path: 'playlists',
    component: PlaylistsViewComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'MediaManager'] }
  },
  {
    path: 'events',
    component: PublicEventComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'MediaManager'] }
  },
  {
    path: 'stream',
    component: StreamComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'BroadcastManager'] }
  },
  {
    path: 'broadcast',
    component: BroadcastComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'BroadcastManager'] }
  },
  {
    path: 'media',
    component: MediaMenuComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'MediaManager'] }
  },
  {
    path: 'calendars',
    component: CalendarsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'CalendarManager'] }
  },
  {
    path: 'calendars/details/:id',
    component: CalendarDetailsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'CalendarManager'] }
  },
  {
    path: 'users',
    component: UsersPageComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },

];
