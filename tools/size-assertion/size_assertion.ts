/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exec} from 'shelljs';

const SOURCE_EXPLORER = `/Users/misko/.nvm/versions/node/v10.11.0/bin/source-map-explorer`;

export interface PathSizeMap { [path: string]: number; }
export type Differences = Array<string>;

export class SizeChecker {
  actual: PathSizeMap = this.computeSizes();
  constructor(public jsMinifiedPath: string, public allowedPercentDiff: number = 2) {}

  assertSizeAndPrintError(expected: PathSizeMap): boolean {
    const difference = this.compare(expected);
    difference.forEach(error => console.error(error));
    return difference.length == 0;
  }

  compare(expected: PathSizeMap): Differences {
    const differences: Differences = [];
    Object.keys(this.actual).forEach((path) => {
      const actualSize = this.actual[path];
      const expectedSize = expected[path];
      if (expectedSize == null) {
        differences.push('Expectation is missing: ' + path);
      } else if (!this.isCloseEnough(actualSize, expectedSize)) {
        differences.push(
            path + ' differs by more than ' + this.allowedPercentDiff + '% expected=' +
            expectedSize + ' actual=' + actualSize);
      }
    });
    Object.keys(expected).forEach((path) => {
      const actualSize = this.actual[path];
      if (actualSize == null) {
        differences.push('Expectation has extra: ' + path);
      }
    });
    return differences;
  }

  isCloseEnough(v1: number, v2: number): boolean {
    return (Math.abs(v1 - v2) / ((v2 + v2) / 2)) * 100 < this.allowedPercentDiff;
  }

  computeSizes(): PathSizeMap {
    const path = this.jsMinifiedPath;
    let stdout: string;
    if (path.startsWith('json:')) {
      stdout = path.substr('json:'.length);
    } else {
      console.log('>>>>', path);
      stdout = exec(`${SOURCE_EXPLORER} ${path} --json`, {silent: false}).stdout.toString();
    }
    return JSON.parse(stdout);
  }
}