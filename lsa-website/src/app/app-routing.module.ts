import { NgModule } from '@angular/core';
import { provideRouter, RouterModule, Routes, withComponentInputBinding  } from '@angular/router';
import { PageRendererComponent } from './components/page-renderer/page-renderer.component';

const routes: Routes  = [
  { path: ':pageName', component: PageRendererComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }, // Redirect any unknown paths to home
];

@NgModule({
  providers: [
    provideRouter(routes, withComponentInputBinding()),
  ],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
