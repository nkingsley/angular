/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, NgModuleRef} from '@angular/core';
import {bindAction, profile} from '../../util';
import {StylingModule} from './styling';

const empty = [];
const items = [];
for (let i = 0; i < 2000; i++) {
  items.push(i);
}


export function init(moduleRef: NgModuleRef<StylingModule>) {
  const injector = moduleRef.injector;
  const appRef = injector.get(ApplicationRef);
  const component = appRef.components[0].instance;
  const select = document.querySelector('#scenario-select') !as HTMLSelectElement;

  function create(tplRefIdx: number) {
    component.tplRefIdx = tplRefIdx;
    component.data = items;
    appRef.tick();
  }

  function destroy() {
    component.data = empty;
    appRef.tick();
  }

  function detectChanges() {
    component.exp = component.exp === 'bar' ? 'baz' : 'bar';
    appRef.tick();
  }

  bindAction('#create', () => create(select.selectedIndex));
  bindAction('#detectChanges', detectChanges);
  bindAction('#destroy', destroy);
  bindAction('#profile', profile(() => {
               for (let i = 0; i < 10; i++) {
                 detectChanges();
               }
             }, () => {}, 'detect changes'));
}
