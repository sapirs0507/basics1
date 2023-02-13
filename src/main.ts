import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import esri = __esri;



platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

  