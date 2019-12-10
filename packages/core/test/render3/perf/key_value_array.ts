/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Key3ValueArray, KeyValueArray, arrayInsert2, arrayInsert4, key3ValueArrayIndexOf, keyValueArrayGet, keyValueArrayIndexOf, keyValueArraySet} from '@angular/core/src/util/array_utils';

import {createBenchmark} from './micro_bench';

function mapSetConditional(map: Map<string, any>, key: string, value: any): void {
  if (map.get(key) === undefined) map.set(key, value);
}

function mapRead(map: Map<string, any>): void {
  map.forEach((value, key) => {
    if (value === -1) throw new Error(key);
  });
}

function keyValueArraySetConditional(
    keyValueArray: KeyValueArray<any>, key: string, value: any): void {
  const index = keyValueArrayIndexOf(keyValueArray, key);
  if (index < 0) {
    arrayInsert2(keyValueArray, ~index, key, value);
  }
}

function key3ValueArraySetConditional(
    keyValueArray: Key3ValueArray<any, any, any>, key: string, value1: any, value2: any): void {
  const index = key3ValueArrayIndexOf(keyValueArray, key);
  if (index < 0) {
    arrayInsert4(keyValueArray, ~index, key, value1, value2, null);
  }
}

function keyValueArrayRead(keyValueArray: KeyValueArray<any>): void {
  for (let i = 0; i < keyValueArray.length; i++) {
    const key = keyValueArray[i++];
    const value = keyValueArray[i];
    if (value === -1) throw new Error(key);
  }
}

function key3ValueArrayRead(keyValueArray: Key3ValueArray<any, any, any>): void {
  for (let i = 0; i < keyValueArray.length; i++) {
    const key = keyValueArray[i++];
    const value1 = keyValueArray[i++];
    const value2 = keyValueArray[i++];
    const value3 = keyValueArray[i];
    if (value1 === -1) throw new Error(key + value1 + value2 + value3);
  }
}


const benchmark1 = createBenchmark('KeyValueArray vs Map');

const mapTime = benchmark1('Map');
while (mapTime()) {
  const map = new Map<string, any>();
  mapSetConditional(map, 'foo', true);
  mapRead(map);
}

const map = new Map<string, any>();
const mapReuseTime = benchmark1('Map (reuse)');
while (mapReuseTime()) {
  map.clear();
  mapSetConditional(map, 'foo', true);
  mapRead(map);
}

const keyValueArrayTime = benchmark1('KeyValueArray');
while (keyValueArrayTime()) {
  const keyValueArray: KeyValueArray<any> = [] as any;
  keyValueArraySetConditional(keyValueArray, 'foo', true);
  keyValueArrayRead(keyValueArray);
}

const keyValueArray: KeyValueArray<any> = [] as any;
const keyValueArrayReuseTime = benchmark1('KeyValueArray (reuse)');
while (keyValueArrayReuseTime()) {
  while (keyValueArray.length) {
    keyValueArray.pop();
  }
  keyValueArraySetConditional(keyValueArray, 'foo', true);
  keyValueArrayRead(keyValueArray);
}

const benchmark3 = createBenchmark('KeyValueArray vs Map x3');

const map3Time = benchmark3('Map');
while (map3Time()) {
  const map = new Map<string, any>();
  mapSetConditional(map, 'foo', true);
  mapSetConditional(map, 'bar', true);
  mapSetConditional(map, 'baz', true);
  mapRead(map);
}

const keyValueArray3Time = benchmark3('KeyValueArray');
while (keyValueArray3Time()) {
  const keyValueArray: KeyValueArray<any> = [] as any;
  keyValueArraySetConditional(keyValueArray, 'foo', true);
  keyValueArraySetConditional(keyValueArray, 'bar', true);
  keyValueArraySetConditional(keyValueArray, 'baz', true);
  keyValueArrayRead(keyValueArray);
}

const benchmark10 = createBenchmark('KeyValueArray vs Map x10');

const map10Time = benchmark10('Map');
while (map10Time()) {
  const map = new Map<string, any>();
  mapSetConditional(map, 'foo0', true);
  mapSetConditional(map, 'bar1', true);
  mapSetConditional(map, 'baz2', true);
  mapSetConditional(map, 'foo3', true);
  mapSetConditional(map, 'bar4', true);
  mapSetConditional(map, 'baz5', true);
  mapSetConditional(map, 'foo6', true);
  mapSetConditional(map, 'bar7', true);
  mapSetConditional(map, 'baz8', true);
  mapSetConditional(map, 'baz9', true);
  mapRead(map);
}

const keyValueArray10Time = benchmark10('KeyValueArray');
while (keyValueArray10Time()) {
  const keyValueArray: KeyValueArray<any> = [] as any;
  keyValueArraySetConditional(keyValueArray, 'foo0', true);
  keyValueArraySetConditional(keyValueArray, 'bar1', true);
  keyValueArraySetConditional(keyValueArray, 'baz2', true);
  keyValueArraySetConditional(keyValueArray, 'foo3', true);
  keyValueArraySetConditional(keyValueArray, 'bar4', true);
  keyValueArraySetConditional(keyValueArray, 'baz5', true);
  keyValueArraySetConditional(keyValueArray, 'foo6', true);
  keyValueArraySetConditional(keyValueArray, 'bar7', true);
  keyValueArraySetConditional(keyValueArray, 'baz8', true);
  keyValueArraySetConditional(keyValueArray, 'baz9', true);
  keyValueArrayRead(keyValueArray);
}


const benchmarkObj10 = createBenchmark('KeyValueArray vs Map x10 (obj)');

const mapObj10Time = benchmarkObj10('Map');
while (mapObj10Time()) {
  const map = new Map<string, any>();
  mapSetConditional(map, 'foo0', obj(true, false));
  mapSetConditional(map, 'bar1', obj(true, false));
  mapSetConditional(map, 'baz2', obj(true, false));
  mapSetConditional(map, 'foo3', obj(true, false));
  mapSetConditional(map, 'bar4', obj(true, false));
  mapSetConditional(map, 'baz5', obj(true, false));
  mapSetConditional(map, 'foo6', obj(true, false));
  mapSetConditional(map, 'bar7', obj(true, false));
  mapSetConditional(map, 'baz8', obj(true, false));
  mapSetConditional(map, 'baz9', obj(true, false));
  mapRead(map);
}

const keyValueArrayObj10Time = benchmarkObj10('KeyValueArray');
while (keyValueArrayObj10Time()) {
  const keyValueArray: Key3ValueArray<any, any, any> = [] as any;
  key3ValueArraySetConditional(keyValueArray, 'foo0', true, false);
  key3ValueArraySetConditional(keyValueArray, 'bar1', true, false);
  key3ValueArraySetConditional(keyValueArray, 'baz2', true, false);
  key3ValueArraySetConditional(keyValueArray, 'foo3', true, false);
  key3ValueArraySetConditional(keyValueArray, 'bar4', true, false);
  key3ValueArraySetConditional(keyValueArray, 'baz5', true, false);
  key3ValueArraySetConditional(keyValueArray, 'foo6', true, false);
  key3ValueArraySetConditional(keyValueArray, 'bar7', true, false);
  key3ValueArraySetConditional(keyValueArray, 'baz8', true, false);
  key3ValueArraySetConditional(keyValueArray, 'baz9', true, false);
  key3ValueArrayRead(keyValueArray);
}

function obj(a: any, b: any) {
  return {a: a, b: b};
}


benchmark1.report();
benchmark3.report();
benchmark10.report();
benchmarkObj10.report();
