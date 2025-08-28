import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import './utils/object.extensions';
import './utils/string.extensions';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
