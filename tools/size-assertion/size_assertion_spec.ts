/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SizeChecker} from './size_assertion';

describe('SizeChecker', () => {
  it('should compare percentage wise', () => {
    const checker = new SizeChecker('json:{}', 2);
    expect(checker.isCloseEnough(1, 1)).toBe(true);
    expect(checker.isCloseEnough(100, 99)).toBe(true);
    expect(checker.isCloseEnough(100, 101)).toBe(true);
    expect(checker.isCloseEnough(100, 103)).toBe(false);
  });

  it('should pass', () => {
    const checker = new SizeChecker('json:{"pathA":123}', 2);
    expect(checker.compare({'pathA': 123})).toEqual([]);
  });

  it('should print errors', () => {
    const checker = new SizeChecker('json:{"pathA":1234, "pathB": 0}', 2);
    expect(checker.compare({pathA: 123, pathC: 0})).toEqual([
      'pathA differs by more than 2% expected=123 actual=1234',
      'Expectation is missing: pathB',
      'Expectation has extra: pathC',
    ]);
  });


});