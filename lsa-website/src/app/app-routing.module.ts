import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageRendererComponent } from './components/page-renderer/page-renderer.component';

const routes: Routes = [
  { path: ':id', component: PageRendererComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }, // Redirect any unknown paths to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
