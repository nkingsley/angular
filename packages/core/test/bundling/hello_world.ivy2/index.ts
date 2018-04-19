/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineComponent, renderComponent, text} from './ivy';

export class HelloWorld {
  static ngComponentDef = defineComponent({
    type: HelloWorld,
    selectors: [['hello-world']],
    factory: function() { return new HelloWorld(); },
    template: function(rf: any, ctx: any) { 1&rf && text(0, 'Hello World!'); }
  });
}

renderComponent(HelloWorld);
