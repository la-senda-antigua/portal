import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageRendererComponent } from './components/page-renderer/page-renderer.component';

const routes: Routes = [
  { path: 'home', component: PageRendererComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
