import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { tap } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';

export function initializeApp(configService: AppConfigService) {
  return configService
    .loadConfig()
    .pipe(tap((config) => configService.initializeConfig(config)));
}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    provideHttpClient(),
    provideAppInitializer(() => initializeApp(inject(AppConfigService))),
  ],
})
export class AppModule {}
