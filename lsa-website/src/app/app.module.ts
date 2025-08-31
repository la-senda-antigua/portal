import { provideHttpClient } from '@angular/common/http';
import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { tap } from 'rxjs';
import { AppConfigService } from './app-config/app-config.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MobileMenuComponent } from './components/mobile-menu/mobile-menu.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { AppStateReducerMap } from './state/videos.selectors';

export function initializeApp(configService: AppConfigService) {
  return configService
    .loadConfig()
    .pipe(tap((config) => configService.initializeConfig(config)));
}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NavBarComponent,
    MatSidenavModule,
    MobileMenuComponent,
    StoreModule.forRoot(AppStateReducerMap)
  ],
  providers: [
    provideHttpClient(),
    provideAppInitializer(() => initializeApp(inject(AppConfigService))),
  ],
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry) {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}
