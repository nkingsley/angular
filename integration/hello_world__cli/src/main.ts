import { enableProdMode } from '@angular/core';
import { platform } from '@angular/core';

import { AppModuleNgFactory } from './$$_gendir/app/app.module.ngfactory';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platform.bootstrapModuleFactory(AppModuleNgFactory);
