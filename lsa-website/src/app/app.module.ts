import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { tap } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MobileMenuComponent } from './components/mobile-menu/mobile-menu.component';

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
