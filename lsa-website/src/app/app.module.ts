import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { lastValueFrom } from 'rxjs';

export function initializeApp(configService: AppConfigService) {
  return () =>
    lastValueFrom(configService.loadConfig()).then((config) =>
      configService.initializeConfig(config)
    );
}

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule, AppRoutingModule], providers: [
        AppConfigService,
        {
            provide: 'APP_INITIALIZER',
            useFactory: initializeApp,
            deps: [AppConfigService],
            multi: true,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
