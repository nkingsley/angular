/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ɵɵelement } from "@angular/core";
import { TemplateFixture } from "./render_util";
import { LCursor, createLCursor, resetLCursor, nextLCursor } from "@angular/core/src/render3/node_manipulation";

fdescribe('cursor', () => {
  it('should return root elements', () => {

    const fixture = new TemplateFixture(() => {
      ɵɵelement(0, 'span');
      ɵɵelement(1, 'b');
    }, noop, 2);
    const lView = fixture.hostView;
    const span = fixture.containerElement.querySelector('span');
    const b = fixture.containerElement.querySelector('span');

    const cursor: LCursor = createLCursor();
    resetLCursor(cursor, lView);
    debugger;
    expect(nextLCursor(cursor)).toEqual(span);
    expect(nextLCursor(cursor)).toEqual(b);
    expect(nextLCursor(cursor)).toEqual(null);
  });
});

function noop() { }
