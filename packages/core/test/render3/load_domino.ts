/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Needed to run animation tests
require('zone.js/dist/zone-node.js');

import '@angular/compiler'; // For JIT mode. Must be in front of any other @angular/* imports.
import {DominoAdapter} from '@angular/platform-server/src/domino_adapter';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

if (typeof window == 'undefined') {
  const domino = require('domino');
  const dominoImpl = domino.impl;

  DominoAdapter.makeCurrent();
  (global as any).document = getDOM().getDefaultDocument();

  // Trick to avoid Event patching from
  // https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
  // It fails with Domino with TypeError: Cannot assign to read only property
  // 'stopImmediatePropagation' of object '#<Event>'
  (global as any).Event = null;


  // HACK: https://github.com/fgnass/domino/issues/141
  const Element = dominoImpl.Element;
  // const Comment = dominoImpl.Comment;
  // const Node = dominoImpl.Node;
  // const nodeProto = Node.prototype;

  // const Node_insertBefore = function(
  //     this: Node, newNode: Node, referenceNode: Node|null|undefined) {
  //   if (referenceNode) {
  //     nodeProto.insertBefore.call(this, newNode, referenceNode);
  //   } else {
  //     nodeProto.appendChild.call(this, newNode);
  //   }
  // };

  // Object.defineProperty(
  //     Element.prototype, 'insertBefore',
  //     {configurable: true, writable: true, value: Node_insertBefore});

  // Object.defineProperty(
  //     Comment.prototype, 'insertBefore',
  //     {configurable: true, writable: true, value: Node_insertBefore});

  // For animation tests, see
  // https://github.com/angular/angular/blob/master/packages/animations/browser/src/render/shared.ts#L140
  (global as any).Element = Element;
  (global as any).isBrowser = false;
  (global as any).isNode = true;
}
