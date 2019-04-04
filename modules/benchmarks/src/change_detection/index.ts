/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {platformBrowser} from '@angular/platform-browser';
import {ApplicationModule} from './application';
import {ApplicationModuleNgFactory} from './application.ngfactory';

setMode(ApplicationModule.hasOwnProperty('ngInjectorDef') ? 'Ivy' : 'ViewEngine');
platformBrowser().bootstrapModuleFactory(ApplicationModuleNgFactory);

function setMode(name: string): void {
  document.querySelector('#rendererMode') !.textContent = `Render Mode: ${name}`;
}