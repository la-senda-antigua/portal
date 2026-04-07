import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { AppModule } from './app/app.module';
import './utils/object.extensions';
import './utils/string.extensions';

registerLocaleData(localeEs);
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
