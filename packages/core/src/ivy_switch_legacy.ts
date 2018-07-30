/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from './di';
import {CompilerFactory, CompilerOptions} from './linker/compiler';
import {NgModuleFactory} from './linker/ng_module_factory';
import {Type} from './type';


export const ivyEnabled = false;
export const R3_COMPILE_COMPONENT: ((type: any, meta: any) => void)|null = null;
export const R3_COMPILE_DIRECTIVE: ((type: any, meta: any) => void)|null = null;
export const R3_COMPILE_INJECTABLE: ((type: any, meta: any) => void)|null = null;
export const R3_COMPILE_NGMODULE: ((type: any, meta: any) => void)|null = null;
export const R3_COMPILE_PIPE: ((type: any, meta: any) => void)|null = null;

export function compileModuleToModuleFactory<T>(
    moduleType: Type<T>, injector: Injector,
    options: CompilerOptions): Promise<NgModuleFactory<T>> {
  const compilerFactory: CompilerFactory = injector.get(CompilerFactory);
  const compiler = compilerFactory.createCompiler([options]);

  return compiler.compileModuleAsync(moduleType)
}
