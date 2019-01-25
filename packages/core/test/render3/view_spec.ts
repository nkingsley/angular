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

    viewContainerInsertAfter(commentViewContainer, embeddedViewFactory({name: 'Kara'}), null);
    viewContainerInsertAfter(commentViewContainer, embeddedViewFactory({name: 'Ben'}), null);

    const divViewContainer = getViewContainer(fixture.hostElement.firstChild !) !;
    viewContainerInsertAfter(divViewContainer, embeddedViewFactory({name: 'Misko'}), null);

    debugger;
    fixture.update();
    console.log(fixture.htmlWithContainerComments);
    expect(fixture.htmlWithContainerComments)
        .toEqual('<div></div><!--container--><b>Hello </b><i>Ben</i><b>Hello </b><i>Kara</i>');
  });
});
