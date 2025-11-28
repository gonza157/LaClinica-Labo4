import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { provideCharts } from 'ng2-charts';


registerLocaleData(localeEs);

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    provideCharts(),
    ...(appConfig.providers || []),
    { provide: LOCALE_ID, useValue: 'es-AR' }
  ]
}).then(() => {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.style.display = 'none';
  }
})
  .catch((err) => console.error(err));

