/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A lifecycle hook that is called after the view of the component has undergone structural changes.
 *
 * See `AfterViewChanged.ngAfterViewChanged` for more details.
 */
export interface AfterViewChanged {
  /**
   * A lifecycle hook that is called after the view of the component has undergone structural
   * changes.
   *
   * `AfterViewChanged` hook is invoked whenever a component view undergoes a structural change.
   * This
   * can only occur when an embedded-view is added or removed from component view (or its sub
   * embedded-views).
   *
   * A structural change to a component indicates that a new DOM elements have been added or removed
   * from the view. This is useful to know since any such change may invalidate queries.
   *
   * A typical usage for `AfterViewChanged` is to invoke `query`/`queryAll` function from the hook.
   *
   * Invoked after:
   * - Initial render of the component. (Right after `AfterViewChecked`)
   * - Any time an embedded view has been added/remove from the component view.
   *
   * Not invoked if:
   * - Only binding (non-structural) changes have occurred in the component view.
   */
  ngAfterViewChanged(): void;
}
