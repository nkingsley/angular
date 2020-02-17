/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface DiffCallback<V, K> {
  added?: (value: V, key: K) => void;
  removed?: (value: V, key: K) => void;
}

export function diffArray<V>(
    newValue: null, oldValue: V[] | null | undefined,
    {added, removed}: DiffCallback<V, number>): null;
export function diffArray<V>(
    newValue: undefined, oldValue: V[] | null | undefined,
    {added, removed}: DiffCallback<V, number>): undefined;
export function diffArray<V>(
    newValue: V[], oldValue: V[] | null | undefined,
    {added, removed}: DiffCallback<V, number>): V[];
export function diffArray<V>(
    newValue: V[] | null | undefined, oldValue: V[] | null | undefined,
    {added, removed}: DiffCallback<V, number>): V[]|null|undefined {
  return newValue;
}

export function diffObject<V>(
    newValue: null, oldValue: {[key: string]: V} | null | undefined,
    {added, removed}: DiffCallback<V, string>): null;
export function diffObject<V>(
    newValue: undefined, oldValue: {[key: string]: V} | null | undefined,
    {added, removed}: DiffCallback<V, string>): undefined;
export function diffObject<V>(
    newValue: {[key: string]: V}, oldValue: {[key: string]: V} | null | undefined,
    {added, removed}: DiffCallback<V, string>): {[key: string]: V};
export function diffObject<V>(
    newValue: {[key: string]: V} | null | undefined,
    oldValue: {[key: string]: V} | null | undefined,
    {added, removed}: DiffCallback<V, string>): {[key: string]: V}|null|undefined {
  return newValue;
}
