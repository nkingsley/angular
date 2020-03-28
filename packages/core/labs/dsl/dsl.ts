/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeTransform, Type} from '@angular/core';

export interface ElementDecorator<T> { __brand__: 'ElementModifier'; }

export interface ContextFn<T> { (context: T): any; }

export interface ChildrenDSL { (): void; }

export interface ElementDSL<T> {
  (name: string, ...modifiers: (ElementDecorator<T>|ChildrenDSL)[]): void;
}

export interface AttributeDSL<T> {
  (name: string, value: string): ElementDecorator<T>;
  (name1: string, value1: string,  //
   name2: string, value2: string,  //
   ): ElementDecorator<T>;
}

export interface BindDSL<T> { (name: string, fn: ContextFn<T>): ElementDecorator<T>; }

export interface TextDSL<T> {
  (text: string): void;
  (fn: ContextFn<T>): void;
}

export interface PipeDSL<T> {
  <P extends PipeTransform>(type: Type<P>):
      (...args: Parameters<P['transform']>) => ReturnType<P['transform']>;
}

export interface InterpolateDSL<T> { (...parts: (string|ContextFn<T>)[]): ContextFn<T>; }

export interface DirectiveDSL<T> { (directiveType: Type<any>): ElementDecorator<T>; }

export interface ComponentDSL<T> {
  element: ElementDSL<T>;
  text: TextDSL<T>;

  attr: AttributeDSL<T>;
  bind: BindDSL<T>;

  interpolate: InterpolateDSL<T>;
  pipe: PipeDSL<T>;

  directive: DirectiveDSL<T>;
}

export function defineComponent<T>(
    componentType: Type<T>, declaration: (dsl: ComponentDSL<T>) => void): void {}