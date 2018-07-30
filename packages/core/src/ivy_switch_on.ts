/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from './di';
import {CompilerOptions} from './linker/compiler';
import {NgModuleFactory} from './render3';
import {compileComponent, compileDirective} from './render3/jit/directive';
import {compileInjectable} from './render3/jit/injectable';
import {compileNgModule} from './render3/jit/module';
import {compilePipe} from './render3/jit/pipe';
import {Type} from './type';

export const ivyEnabled = true;
export const R3_COMPILE_COMPONENT = compileComponent;
export const R3_COMPILE_DIRECTIVE = compileDirective;
export const R3_COMPILE_INJECTABLE = compileInjectable;
export const R3_COMPILE_NGMODULE = compileNgModule;
export const R3_COMPILE_PIPE = compilePipe;

export function compileModuleToModuleFactory<T>(
    moduleType: Type<T>, injector: Injector,
    options: CompilerOptions): Promise<NgModuleFactory<T>> {
  return Promise.resolve(new NgModuleFactory(moduleType));
}
