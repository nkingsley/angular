/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplateFixture} from './render_util';
import {template, element, RenderFlags, elementEnd, elementStart, text, textBinding, bind} from '@angular/core/src/render3';
import {getEmbeddedViewFactory, viewContainerInsertAfter, getViewContainer} from '@angular/core/src/render3/view';


describe('getEmbeddedViewFactory', () => {
  fit('should get the embedded view from a comment added by ng-template', () => {

    const log: any[] = [];
    const fixture = new TemplateFixture(
        () => {
          element(0, 'div');
          template(1, (rf: RenderFlags, ctx: any) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'b');
              text(1, 'Hello ');
              elementEnd();
              elementStart(2, 'i');
              text(3);
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              textBinding(3, bind(ctx.name));
              log.push(ctx.name);
            }
          }, 4, 1);
        },
        () => {

        },
        2, 0);

    const comment = fixture.hostElement.lastChild !;
    expect(comment.nodeType).toBe(Node.COMMENT_NODE);
    const embeddedViewFactory = getEmbeddedViewFactory(comment) !;
    expect(typeof embeddedViewFactory).toEqual('function');

    const commentViewContainer = getViewContainer(comment) !;

    const bView = embeddedViewFactory({name: 'B'});
    // Putting this in the very front.
    viewContainerInsertAfter(commentViewContainer, bView, null);
    // Now putting this in front of B (because it's in the very front).
    viewContainerInsertAfter(commentViewContainer, embeddedViewFactory({name: 'A'}), null);
    // Putting this one after B
    viewContainerInsertAfter(commentViewContainer, embeddedViewFactory({name: 'C'}), bView);

    // Make sure to grab the comment and the div in a different order than declared.
    // We want to assert that change detection is in the same order as the declared elements.
    const divViewContainer = getViewContainer(fixture.hostElement.firstChild !) !;
    viewContainerInsertAfter(divViewContainer, embeddedViewFactory({name: 'X'}), null);

    debugger;
    fixture.update();
    console.log(log);
    console.log(fixture.htmlWithContainerComments);
    expect(log).toEqual(['X', 'A', 'B', 'C']);
    expect(fixture.htmlWithContainerComments)
        .toEqual('<div></div><!--container--><b>Hello </b><i>A</i><b>Hello </b><i>A</i>');
  });
});
