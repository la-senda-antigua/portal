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
import { BroadcastComponent } from './pages/broadcast/broadcast.component';
import { MediaMenuComponent } from './pages/media-menu/media-menu.component';
import { RoleGuard } from './role.guard';
import { UsersPageComponent } from './pages/users-page/users-page.component';
import { CalendarsComponent } from './pages/calendars/calendars.component';
import { UserGroupsComponent } from './pages/user-groups/user-groups.component';
import { UserRole } from './models/PortalUser';

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
    data: { roles: [UserRole.Admin, UserRole.MediaManager] }
  },
  {
    path: 'preachers',
    component: PreachersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin, UserRole.MediaManager] }
  },
  {
    path: 'courses',
    component: BibleCoursesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin, UserRole.MediaManager] }
  },
  {
    path: 'gallery',
    component: GalleryVideosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin, UserRole.MediaManager] }
  },
  {
    path: 'playlists',
    component: PlaylistsViewComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin, UserRole.MediaManager] }
  },
  {
    path: 'stream',
    component: StreamComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin, UserRole.BroadcastManager] }
  },
  {
    path: 'broadcast',
    component: BroadcastComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin, UserRole.BroadcastManager] }
  },
  {
    path: 'media',
    component: MediaMenuComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin, UserRole.MediaManager] }
  },
  {
    path: 'calendars',
    component: CalendarsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin, UserRole.CalendarManager] }
  },
  {
    path: 'userGroups',
    component: UserGroupsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin] }
  },
  {
    path: 'users',
    component: UsersPageComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.Admin] }
  },

];
