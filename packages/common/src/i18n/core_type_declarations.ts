/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Plurality cases used for translating plurals to different languages.
 *
 * @see `NgPlural`
 * @see `NgPluralCase`
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 * 
 * @publicApi
 */
export declare enum Plural {
  Zero = 0,
  One = 1,
  Two = 2,
  Few = 3,
  Many = 4,
  Other = 5,
}