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
import {CHILD_HEAD, NEXT, CHILD_TAIL} from '@angular/core/src/render3/interfaces/view';


describe('getEmbeddedViewFactory', () => {
  it('should get the embedded view from a comment added by ng-template', () => {

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

    fixture.update();
    expect(log).toEqual(['X', 'A', 'B', 'C']);
    expect(fixture.htmlWithContainerComments)
        .toEqual(
            '<div></div><b>Hello </b><i>X</i><!--container--><b>Hello </b><i>A</i><b>Hello </b><i>B</i><b>Hello </b><i>C</i>');
  });

  it('should lazily create LContainers and add them to the internal linked list in the order of DOM',
     () => {
       /*
        <one/>
        <two/>
        <three/>
        <four/>
       */
       const fixture = new TemplateFixture(
           () => {
             element(0, 'one');
             element(1, 'two');
             element(2, 'three');
             element(3, 'four');
           },
           () => {

           },
           4, 0);

       const one = fixture.hostElement.querySelector('one') !;
       const two = fixture.hostElement.querySelector('two') !;
       const three = fixture.hostElement.querySelector('three') !;
       const four = fixture.hostElement.querySelector('four') !;

       // This is adding to the CHILD_HEAD and CHILD_TAIL
       const middle2Container = getViewContainer(three);
       // This is inserting to CHILD_HEAD infront of existing CHILD_HEAD
       const oneContainer = getViewContainer(one);
       // This is inserting at CHILD_TAIL, after existing CHILD_TAIL
       const lastContainer = getViewContainer(four);
       // This is inserting in the middle of the list
       const twoContainer = getViewContainer(two);

       let cursor = fixture.hostView[CHILD_HEAD];

       expect(cursor).toBe(oneContainer as any);

       cursor = cursor ![NEXT];
       expect(cursor).toBe(twoContainer as any);

       cursor = cursor ![NEXT];
       expect(cursor).toBe(middle2Container as any);

       cursor = cursor ![NEXT];
       expect(cursor).toBe(lastContainer as any);

       expect(fixture.hostView[CHILD_TAIL]).toBe(cursor);
       expect(cursor ![NEXT]).toEqual(null);
     });

  it('should lazily create LContainers and add them to the internal linked list in order of DOM, depth first',
     () => {
       /*
         <one>
           <two>
             <three>
               <four/>
             </three>
           </two>
         </one>
       */
       const fixture = new TemplateFixture(
           () => {
             elementStart(0, 'one');
             {
               elementStart(1, 'two');

               {
                 elementStart(2, 'three');
                 {
                   element(3, 'four');  //
                 }
                 elementEnd();
               }
               elementEnd();
             }
             elementEnd();
           },
           () => {

           },
           4, 0);

       const one = fixture.hostElement.querySelector('one') !;
       const two = fixture.hostElement.querySelector('two') !;
       const three = fixture.hostElement.querySelector('three') !;
       const four = fixture.hostElement.querySelector('four') !;

       // This is adding to the CHILD_HEAD and CHILD_TAIL
       const middle2Container = getViewContainer(three);
       // This is inserting to CHILD_HEAD infront of existing CHILD_HEAD
       const oneContainer = getViewContainer(one);
       // This is inserting at CHILD_TAIL, after existing CHILD_TAIL
       const lastContainer = getViewContainer(four);
       // This is inserting in the middle of the list
       const twoContainer = getViewContainer(two);

       let cursor = fixture.hostView[CHILD_HEAD];

       expect(cursor).toBe(oneContainer as any);

       cursor = cursor ![NEXT];
       expect(cursor).toBe(twoContainer as any);

       cursor = cursor ![NEXT];
       expect(cursor).toBe(middle2Container as any);

       cursor = cursor ![NEXT];
       expect(cursor).toBe(lastContainer as any);

       expect(fixture.hostView[CHILD_TAIL]).toBe(cursor);
       expect(cursor ![NEXT]).toEqual(null);
     });
});
