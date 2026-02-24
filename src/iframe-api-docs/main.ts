import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from 'src/environments/environment';
import { IframeApiDocsModule } from 'src/iframe-api-docs/iframe-api-docs.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(IframeApiDocsModule)
  .catch(err => console.error(err));
