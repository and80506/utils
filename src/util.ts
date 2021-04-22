interface FunctionWithNameProperty extends Function {
  __name__?: string;
  displayName?: string;
}

export type JSONPrimitive = string | boolean | number;
export type JSONObject =
  | { [Key: string]: JSONPrimitive | JSONObject }
  | ReadonlyArray<JSONPrimitive | JSONObject>;
export type JSONType = JSONObject | JSONPrimitive;

export type CancelableType = {
  cancel: () => void;
};

export function getFunctionName(fn: FunctionWithNameProperty): string {
  return fn.name || fn.__name__ || fn.displayName || 'anonymous';
}

export function setFunctionName<T>(fn: T, name: string): T {
  try {
    // @ts-ignore name属性是只读的
    delete fn.name;
    // @ts-ignore name属性是只读的
    fn.name = name;
  } catch (err) {
    // pass
  }

  // @ts-ignore displayName是非标准的特性
  fn.__name__ = fn.displayName = name;
  return fn;
}

export function base64encode(str: string): string {
  if (typeof btoa === 'function') {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  throw new Error(`Can not find window.btoa or Buffer`);
}

export function base64decode(str: string): string {
  if (typeof atob === 'function') {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c: string) => {
          // eslint-disable-next-line prefer-template
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('utf8');
  }

  throw new Error(`Can not find window.atob or Buffer`);
}

export function uniqueID(): string {
  const chars = '0123456789abcdef';

  const randomID = 'xxxxxxxxxx'.replace(/./g, () => {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  });

  const timeID = base64encode(new Date().toISOString().slice(11, 19).replace('T', '.'))
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  return `${randomID}_${timeID}`;
}

let objectIDs: WeakMap<Object, any>;
export function getObjectID(obj: Object): string {
  objectIDs = objectIDs || new WeakMap();

  if (obj === null || obj === undefined || (typeof obj !== 'object' && typeof obj !== 'function')) {
    throw new Error(`Invalid object`);
  }

  let uid = objectIDs.get(obj);

  if (!uid) {
    uid = `${typeof obj}:${uniqueID()}`;
    objectIDs.set(obj, uid);
  }

  return uid;
}

function serializeArgs(args: ReadonlyArray<any>): string {
  try {
    return JSON.stringify(Array.prototype.slice.call(args), (subkey, val) => {
      if (typeof val === 'function') {
        return `memoize[${getObjectID(val)}]`;
      }
      return val;
    });
  } catch (err) {
    throw new Error('Arguments not serializable -- can not be used to memoize');
  }
}

type WeakMapOrObject = WeakMap<Object, any> | { [key: string]: any };

function getOrSet<T>(weakMapOrObject: WeakMapOrObject, key: string | Object, getter: () => T) {
  const isWK = isWeakMap(weakMapOrObject);
  if (isWK) {
    if ((weakMapOrObject as WeakMap<Object, any>).has(key as Object)) {
      return (weakMapOrObject as WeakMap<Object, any>).get(key as Object);
    }
  } else {
    if (weakMapOrObject.hasOwnProperty(key as string)) {
      return (weakMapOrObject as { [key: string]: any })[key as string];
    }
  }
  const value = getter();
  if (isWK) {
    weakMapOrObject.set(key as Object, value);
  } else {
    (weakMapOrObject as { [key: string]: any })[key as string] = value;
  }
  return value;
}

interface MemoizeOptions {
  name?: string;
  time?: number;
  thisNamespace?: boolean;
}

function getDefaultMemoizeOptions(): MemoizeOptions {
  return {};
}

export interface Memoized<T> {
  (...args: ReadonlyArray<any>): T;
  reset: () => void;
}

let memoizeGlobalIndex = 0;
let memoizeGlobalIndexValidFrom = 0;
export function memoize<T>(
  method: (...args: ReadonlyArray<any>) => T,
  options: MemoizeOptions = getDefaultMemoizeOptions()
): Memoized<T> {
  const { thisNamespace = false, time: cacheTime } = options;

  let simpleCache: { [key: string]: any };
  let thisCache: WeakMap<Object, any>;

  let memoizeIndex = memoizeGlobalIndex;
  memoizeGlobalIndex += 1;

  const memoizedFunction = function memoizedFunction(...args: any[]) {
    if (memoizeIndex < memoizeGlobalIndexValidFrom) {
      simpleCache = null;
      thisCache = null;
      memoizeIndex = memoizeGlobalIndex;
      memoizeGlobalIndex += 1;
    }

    let cache;

    if (thisNamespace) {
      thisCache = thisCache || new WeakMap();
      cache = getOrSet(thisCache, this, getEmptyObject);
    } else {
      cache = simpleCache = simpleCache || {};
    }

    const cacheKey = serializeArgs(args);
    let cacheResult = cache[cacheKey];

    if (cacheResult && cacheTime && Date.now() - cacheResult.time < cacheTime) {
      delete cache[cacheKey];
      cacheResult = null;
    }

    if (cacheResult) {
      return cacheResult.value;
    }

    const time = Date.now();
    const value = method.apply(this, arguments);

    cache[cacheKey] = { time, value };

    return value;
  };

  memoizedFunction.reset = () => {
    simpleCache = null;
    thisCache = null;
  };

  const result = memoizedFunction;

  return setFunctionName(result, `${options.name || getFunctionName(method)}::memoized`);
}

memoize.clear = () => {
  memoizeGlobalIndexValidFrom = memoizeGlobalIndex;
};

interface FunctionWithMemoizeProperty<T> {
  (...args: ReadonlyArray<any>): T;
  // eslint-disable-next-line camelcase
  __inline_memoize_cache?: { [key: string]: T };
}

export function inlineMemoize<T>(
  method: FunctionWithMemoizeProperty<T>,
  logic: (...args: ReadonlyArray<any>) => T,
  args: ReadonlyArray<any> = []
): T {
  // eslint-disable-next-line camelcase
  const cache = (method.__inline_memoize_cache = method.__inline_memoize_cache || {});
  const key = serializeArgs(args);

  if (cache.hasOwnProperty(key)) {
    return cache[key];
  }

  const result = (cache[key] = logic(...args));

  return result;
}

export function noop(..._args: readonly any[]) {
  // pass
}

export function once(method: (...args: any[]) => any): (...args: any[]) => any {
  let called = false;

  const onceFunction = function (): any {
    if (!called) {
      called = true;
      return method.apply(this, arguments);
    }
  };

  return setFunctionName(onceFunction, `${getFunctionName(method)}::once`);
}

export function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str[i].charCodeAt(0) * Math.pow((i % 10) + 1, 5);
  }
  return Math.floor(Math.pow(Math.sqrt(hash), 5));
}

export function strHashStr(str: string): string {
  let hash = '';

  for (let i = 0; i < str.length; i++) {
    let total = str[i].charCodeAt(0) * i;

    if (str[i + 1]) {
      total += str[i + 1].charCodeAt(0) * (i - 1);
    }

    hash += String.fromCharCode(97 + (Math.abs(total) % 26));
  }

  return hash;
}

export function match(str: string, pattern: RegExp): string | undefined {
  const regMatch = str.match(pattern);
  if (regMatch) {
    return regMatch[0];
  }
}

export function awaitKey<T>(obj: { [key: string]: any }, key: string): Promise<T> {
  return new Promise((resolve, _reject) => {
    let value = obj[key];

    if (value) {
      return resolve(value);
    }

    delete obj[key];

    Object.defineProperty(obj, key, {
      configurable: true,

      set(item) {
        value = item;

        if (value) {
          resolve(value);
        }
      },

      get(): T {
        return value;
      }
    });
  });
}

export function stringifyError(err: any, level: number = 1): string {
  if (level >= 3) {
    return 'stringifyError stack overflow';
  }

  try {
    if (!err) {
      return `<unknown error: ${Object.prototype.toString.call(err)}>`;
    }

    if (typeof err === 'string') {
      return err;
    }

    if (err instanceof Error) {
      const stack = err && err.stack;
      const message = err && err.message;

      if (stack && message) {
        if (stack.indexOf(message) !== -1) {
          return stack;
        } else {
          return `${message}\n${stack}`;
        }
      } else if (stack) {
        return stack;
      } else if (message) {
        return message;
      }
    }

    if (err && err.toString && typeof err.toString === 'function') {
      return err.toString();
    }

    return Object.prototype.toString.call(err);
  } catch (newErr) {
    return `Error while stringifying error: ${stringifyError(newErr, level + 1)}`;
  }
}

export function stringifyErrorMessage(err: any): string {
  const defaultMessage = `<unknown error: ${Object.prototype.toString.call(err)}>`;

  if (!err) {
    return defaultMessage;
  }

  if (err instanceof Error) {
    return err.message || defaultMessage;
  }

  if (typeof err.message === 'string') {
    return err.message || defaultMessage;
  }

  return defaultMessage;
}

export function stringify(item: any): string {
  if (typeof item === 'string') {
    return item;
  }

  if (item && item.toString && typeof item.toString === 'function') {
    return item.toString();
  }

  return Object.prototype.toString.call(item);
}

export function domainMatches(hostname: string, domain: string): boolean {
  hostname = hostname.split('://')[1];
  const index = hostname.indexOf(domain);
  return index !== -1 && hostname.slice(index) === domain;
}

export function patchMethod(obj: { [key: string]: any }, name: string, handler: Function) {
  const original = obj[name];

  obj[name] = function patchedMethod(): any {
    return handler({
      context: this,
      args: Array.prototype.slice.call(arguments),
      original,
      callOriginal: function () {
        return original.apply(this, arguments);
      }
    });
  };
}

export function extend<T extends { [key: string]: any } | Function>(
  obj: T,
  source: { [key: string]: any }
): T {
  if (!source) {
    return obj;
  }

  if (Object.assign) {
    return Object.assign(obj, source);
  }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      (obj as any)[key] = source[key];
    }
  }

  return obj;
}

export function values<T>(obj: { [key: string]: T }): ReadonlyArray<T> {
  if (Object.values) {
    return Object.values(obj);
  }

  const result = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result.push(obj[key]);
    }
  }

  return result;
}

export const memoizedValues = memoize(values);

export function perc(pixels: number, percentage: number): number {
  return Math.round((pixels * percentage) / 100);
}

export function min(...args: ReadonlyArray<number>): number {
  return Math.min(...args);
}

export function max(...args: ReadonlyArray<number>): number {
  return Math.max(...args);
}

export function roundUp(num: number, nearest: number): number {
  const remainder = num % nearest;
  return remainder ? num - remainder + nearest : num;
}

export function regexMap<T>(str: string, regexp: RegExp, handler: () => T): ReadonlyArray<T> {
  const results: any[] = [];

  str.replace(regexp, function regexMapMatcher(item): any {
    results.push(handler ? handler.apply(null, arguments) : item);
  });

  return results;
}

export function svgToBase64(svg: string): string {
  return `data:image/svg+xml;base64,${base64encode(svg)}`;
}

export function objFilter<T, R>(
  obj: { [key: string]: T },
  filter?: (value: T, key: string) => boolean
): { [key: string]: R } {
  const result = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key) || !filter(obj[key], key)) {
      continue;
    }

    (result as any)[key] = obj[key];
  }

  return result;
}

export function identity<T>(item: T): T {
  return item;
}

export function regexTokenize(text: string, regexp: RegExp): ReadonlyArray<string> {
  const result: string[] = [];
  text.replace(regexp, (token) => {
    result.push(token);
    return '';
  });
  return result;
}

export function promisify(fnOrPromise: Function | Promise<any>): () => Promise<any> {
  return (...args: Array<any>) => {
    if (isPromise(fnOrPromise)) {
      return fnOrPromise as Promise<any>;
    }
    return new Promise((resolve, reject) => {
      function customCallback(err: any, ...results: Array<any>) {
        if (err) {
          return reject(err);
        }
        return resolve(results.length === 1 ? results[0] : results);
      }
      args.push(customCallback);
      (fnOrPromise as Function).call(this, ...args);
    });
  };
}

export function promiseDebounce<T>(
  method: () => Promise<T> | T,
  delay: number = 50
): () => Promise<T> {
  let promise: Promise<T>;
  let timeout: ReturnType<typeof setTimeout>;

  const promiseDebounced = function (): Promise<T> {
    if (timeout) {
      clearTimeout(timeout);
    }

    const localPromise = (promise =
      promise ||
      new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
          promise = null;
          timeout = null;

          promisify(method)()
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject(err);
            });
        }, delay);
      }));

    return localPromise;
  };

  return setFunctionName(promiseDebounced, `${getFunctionName(method)}::promiseDebounced`);
}

export function safeInterval(
  method: (...args: any[]) => any,
  time: number
): { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout>;
  function loop() {
    timeout = setTimeout(() => {
      let needStop = method();
      if (!needStop) {
        loop();
      }
    }, time);
  }

  loop();

  return {
    cancel() {
      clearTimeout(timeout);
    }
  };
}

export function isInteger(str: string): boolean {
  return Boolean(str.match(/^[0-9]+$/));
}

export function isFloat(str: string): boolean {
  return Boolean(str.match(/^[0-9]+\.[0-9]+$/));
}

export function serializePrimitive(value: string | number | boolean): string {
  return value.toString();
}

export function deserializePrimitive(value: string): string | number | boolean {
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else if (isInteger(value)) {
    return parseInt(value, 10);
  } else if (isFloat(value)) {
    return parseFloat(value);
  } else {
    return value;
  }
}

export function dotify(
  obj: { [key: string]: any },
  prefix: string = '',
  newobj: { [key: string]: any } = {}
): { [key: string]: string } {
  prefix = prefix ? `${prefix}.` : prefix;
  for (const key in obj) {
    if (
      !obj.hasOwnProperty(key) ||
      obj[key] === undefined ||
      obj[key] === null ||
      typeof obj[key] === 'function'
    ) {
      continue;
    } else if (
      obj[key] &&
      Array.isArray(obj[key]) &&
      obj[key].length &&
      obj[key].every((val: any) => typeof val !== 'object')
    ) {
      newobj[`${prefix}${key}[]`] = obj[key].join(',');
    } else if (obj[key] && typeof obj[key] === 'object') {
      newobj = dotify(obj[key], `${prefix}${key}`, newobj);
    } else {
      newobj[`${prefix}${key}`] = serializePrimitive(obj[key]);
    }
  }
  return newobj;
}

export function undotify(obj: { [key: string]: string }): Object {
  const result = {};

  for (let key in obj) {
    if (!obj.hasOwnProperty(key) || typeof obj[key] !== 'string') {
      continue;
    }

    let value: any = obj[key];

    if (key.match(/^.+\[\]$/)) {
      key = key.slice(0, -2);
      value = value.split(',').map(deserializePrimitive);
    } else {
      value = deserializePrimitive(value);
    }

    let keyResult: { [key: string]: any } = result;
    const parts = key.split('.');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i + 1 === parts.length;
      const isIndex = !isLast && isInteger(parts[i + 1]);

      if (part === 'constructor' || part === 'prototype' || part === '__proto__') {
        throw new Error(`Disallowed key: ${part}`);
      }

      if (isLast) {
        keyResult[part] = value;
      } else {
        keyResult = keyResult[part] = keyResult[part] || (isIndex ? [] : {});
      }
    }
  }

  return result;
}

export type EventEmitterType = {
  on: (eventName: string, handler: Function) => CancelableType;
  once: (eventName: string, handler: Function) => CancelableType;
  trigger: (eventName: string, ...args: ReadonlyArray<any>) => Promise<void>;
  triggerOnce: (eventName: string, ...args: ReadonlyArray<any>) => Promise<void>;
  reset: () => void;
};

export function eventEmitter(): EventEmitterType {
  const triggered: { [key: string]: boolean } = {};
  let handlers: { [key: string]: Function[] } = {};

  return {
    on(eventName: string, handler: Function): CancelableType {
      const handlerList = (handlers[eventName] = handlers[eventName] || []);

      handlerList.push(handler);

      let cancelled = false;

      return {
        cancel() {
          if (!cancelled) {
            cancelled = true;
            handlerList.splice(handlerList.indexOf(handler), 1);
          }
        }
      };
    },

    once(eventName: string, handler: Function): CancelableType {
      const listener = this.on(eventName, () => {
        listener.cancel();
        handler();
      });

      return listener;
    },

    trigger(eventName: string, ...args: ReadonlyArray<any>): Promise<void> {
      const handlerList = handlers[eventName];
      const promises = [];

      if (handlerList) {
        for (const handler of handlerList) {
          promises.push(
            new Promise((resolve, _reject) => {
              const result = handler(...args);
              resolve(result);
            })
          );
        }
      }

      return Promise.all(promises).then(noop);
    },

    triggerOnce(eventName: string, ...args: ReadonlyArray<any>): Promise<void> {
      if (triggered[eventName]) {
        return Promise.resolve();
      }

      triggered[eventName] = true;
      return this.trigger(eventName, ...args);
    },

    reset() {
      handlers = {};
    }
  };
}

export function camelToDasherize(str: string): string {
  return str.replace(/([A-Z])/g, (g) => {
    return `-${g.toLowerCase()}`;
  });
}

export function dasherizeToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => {
    return g[1].toUpperCase();
  });
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function get(item: { [key: string]: any }, path: string, def: any): any {
  if (!path) {
    return def;
  }

  const pathParts = path.split('.');

  // Loop through each section of our key path

  for (let i = 0; i < pathParts.length; i++) {
    // If we have an object, we can get the key
    if (typeof item === 'object' && item !== null) {
      item = item[pathParts[i]];

      // Otherwise, we should return the default (undefined if not provided)
    } else {
      return def;
    }
  }

  // If our final result is undefined, we should return the default

  return item === undefined ? def : item;
}

export function safeTimeout(method: Function, time: number) {
  const interval = safeInterval(() => {
    time -= 100;
    if (time <= 0) {
      method();
      interval.cancel();
      return true;
    }
  }, 100);
}

export function defineLazyProp<T>(
  obj: { [key in string | number]: any } | ReadonlyArray<any>,
  key: string | number,
  getter: () => T
) {
  if (Array.isArray(obj)) {
    if (typeof key !== 'number') {
      throw new TypeError(`Array key must be number`);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    if (typeof key !== 'string') {
      throw new TypeError(`Object key must be string`);
    }
  }

  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: () => {
      delete (obj as any)[key];
      const value = getter();

      (obj as any)[key] = value;
      return value;
    },
    set: (value: T) => {
      delete (obj as any)[key];

      (obj as any)[key] = value;
    }
  });
}

export function arrayFrom<T>(item: Iterable<T> | ArrayLike<T>): ReadonlyArray<T> {
  // eslint-disable-line no-undef
  return Array.prototype.slice.call(item);
}

export function isObject(item: any): boolean {
  return typeof item === 'object' && item !== null;
}

export function isObjectObject(obj: any): boolean {
  return isObject(obj) && Object.prototype.toString.call(obj) === '[object Object]';
}

export function isPlainObject(obj: any): boolean {
  if (!isObjectObject(obj)) {
    return false;
  }

  const constructor = obj.constructor;

  if (typeof constructor !== 'function') {
    return false;
  }

  const prototype = constructor.prototype;

  if (!isObjectObject(prototype)) {
    return false;
  }

  if (!prototype.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  return true;
}

export function isPromise(item: any): boolean {
  try {
    if (!item) {
      return false;
    }

    if (typeof Promise !== 'undefined' && item instanceof Promise) {
      return true;
    }

    if (
      typeof window !== 'undefined' &&
      typeof window.Window === 'function' &&
      item instanceof window.Window
    ) {
      return false;
    }

    if (
      typeof window !== 'undefined' &&
      typeof window.constructor === 'function' &&
      item instanceof window.constructor
    ) {
      return false;
    }

    const toString = {}.toString;

    if (toString) {
      const name = toString.call(item);

      if (
        name === '[object Window]' ||
        name === '[object global]' ||
        name === '[object DOMWindow]'
      ) {
        return false;
      }
    }

    if (typeof item.then === 'function') {
      return true;
    }
  } catch (err) {
    return false;
  }

  return false;
}

export function replaceObject<T extends ReadonlyArray<any> | Object>(
  item: T,
  replacer: (arg0: any, arg1: string | number, arg2: string) => any,
  fullKey: string = ''
): ReadonlyArray<any> | Object {
  if (Array.isArray(item)) {
    const length = item.length;
    const result: Array<any> = [];

    for (let i = 0; i < length; i++) {
      defineLazyProp(result, i, () => {
        const itemKey = fullKey ? `${fullKey}.${i}` : `${i}`;
        const el = item[i];

        let child = replacer(el, i, itemKey);

        if (isPlainObject(child) || Array.isArray(child)) {
          child = replaceObject(child, replacer, itemKey);
        }

        return child;
      });
    }

    return result;
  } else if (isPlainObject(item)) {
    const result = {};

    for (const key in item) {
      if (!item.hasOwnProperty(key)) {
        continue;
      }

      defineLazyProp(result, key, () => {
        const itemKey = fullKey ? `${fullKey}.${key}` : `${key}`;

        const el = item[key];

        let child = replacer(el, key, itemKey);

        if (isPlainObject(child) || Array.isArray(child)) {
          child = replaceObject(child, replacer, itemKey);
        }

        return child;
      });
    }

    return result;
  } else {
    throw new Error(`Pass an object or array`);
  }
}

export function copyProp(source: Object, target: { [key: string]: any }, name: string, def: any) {
  if (source.hasOwnProperty(name)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, name);

    Object.defineProperty(target, name, descriptor);
  } else {
    target[name] = def;
  }
}

type RegexResultType = {
  text: string;
  groups: ReadonlyArray<string>;
  start: number;
  end: number;
  length: number;
  replace: (text: string) => string;
};

export function regex(pattern: string | RegExp, str: string, start: number = 0): RegexResultType {
  if (typeof pattern === 'string') {
    pattern = new RegExp(pattern);
  }

  const result = str.slice(start).match(pattern);

  if (!result) {
    return;
  }

  const index: number = result.index;
  const regmatch = result[0];

  return {
    text: regmatch,
    groups: result.slice(1),
    start: start + index,
    end: start + index + regmatch.length,
    length: regmatch.length,

    replace(text: string): string {
      if (!regmatch) {
        return '';
      }

      return `${regmatch.slice(0, start + index)}${text}${regmatch.slice(index + regmatch.length)}`;
    }
  };
}

export function regexAll(pattern: string | RegExp, str: string): ReadonlyArray<RegexResultType> {
  const matches = [];
  let start = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const regmatch = regex(pattern, str, start);

    if (!regmatch) {
      break;
    }

    matches.push(regmatch);
    start = regmatch.end;
  }

  return matches;
}

export function isDefined(value: any): boolean {
  return value !== null && value !== undefined;
}

export function cycle(method: (...args: any[]) => any, index = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      method(index);
      void cycle(method, ++index);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function debounce<T>(
  method: (...args: ReadonlyArray<any>) => T,
  time: number = 100
): (...args: ReadonlyArray<any>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  const debounceWrapper = function () {
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      return method.apply(this, arguments);
    }, time);
  };

  return setFunctionName(debounceWrapper, `${getFunctionName(method)}::debounced`);
}

export function isRegex(regx: any): boolean {
  return Object.prototype.toString.call(regx) === '[object RegExp]';
}

export function isWeakMap(wk: any): boolean {
  return Object.prototype.toString.call(wk) === '[object WeakMap]';
}

export function getEmptyObject(): {} {
  return {};
}

type FunctionProxy<T extends Function> = (method: T) => T;

// eslint-disable-next-line
export const weakMapMemoize: FunctionProxy<any> = <R>(
  method: (arg: any) => R
): ((...args: ReadonlyArray<any>) => R) => {
  const weakmap = new WeakMap();

  // eslint-disable-next-line
  return function weakmapMemoized(arg: any): R {
    return getOrSet(weakmap, arg, () => method.call(this, arg));
  };
};

type FunctionPromiseProxy<R, T extends (...args: ReadonlyArray<any>) => Promise<R>> = (arg: T) => T;

// eslint-disable-next-line
export const weakMapMemoizePromise: FunctionPromiseProxy<any, any> = <R>(
  method: (arg: any) => Promise<R>
): ((...args: ReadonlyArray<any>) => Promise<R>) => {
  const weakmap = new WeakMap();

  // eslint-disable-next-line
  return function weakmapMemoizedPromise(arg: any): Promise<R> {
    return getOrSet(weakmap, arg, () =>
      method.call(this, arg).finally(() => {
        weakmap.delete(arg);
      })
    );
  };
};

export type CleanupType = {
  set: <T>(name: string, item: T) => T; // eslint-disable-line no-undef
  register: (fn: Function) => void;
  all: (err?: any) => Promise<void>;
};

export function cleanup(obj: { [key: string]: any }): CleanupType {
  const tasks: Array<Function> = [];
  let cleaned = false;
  let cleanErr: any;

  return {
    set<T>(name: string, item: T): T {
      if (!cleaned) {
        obj[name] = item;
        this.register(() => {
          delete obj[name];
        });
      }
      return item;
    },

    register(method: Function) {
      if (cleaned) {
        method(cleanErr);
      } else {
        tasks.push(once(() => method(cleanErr)));
      }
    },

    all(err?: any): Promise<void> {
      cleanErr = err;

      const results = [];
      cleaned = true;

      while (tasks.length) {
        const task = tasks.shift();
        results.push(task());
      }

      return Promise.all(results).then(noop);
    }
  };
}

export function tryCatch<T>(
  fn: () => T
): { result: T; error: void } | { result: void; error: any } {
  let result;
  let error;

  try {
    result = fn();
  } catch (err) {
    error = err;
  }

  return { result, error };
}

// eslint-disable-next-line
export function removeFromArray<X, T extends Array<X>>(arr: T, item: X) {
  const index = arr.indexOf(item);
  if (index !== -1) {
    arr.splice(index, 1);
  }
}

export function assertExists<T>(name: string, thing: void | null | T): T {
  if (thing === null || typeof thing === 'undefined') {
    throw new Error(`Expected ${name} to be present`);
  }

  return thing;
}

export function unique(arr: ReadonlyArray<string>): ReadonlyArray<string> {
  const result: { [key: string]: boolean } = {};
  for (const item of arr) {
    result[item] = true;
  }
  return Object.keys(result);
}

export const constHas = <X extends string | boolean | number, T extends { [key: string]: X }>(
  constant: T,
  value: X
): boolean => {
  return memoizedValues(constant).indexOf(value) !== -1;
};

export function dedupeErrors<T>(handler: (err: any) => T): (err: any) => T | void {
  const seenErrors: Array<any> = [];
  const seenStringifiedErrors: { [key: string]: boolean } = {};

  return (err) => {
    if (seenErrors.indexOf(err) !== -1) {
      return;
    }

    seenErrors.push(err);

    const stringifiedError = stringifyError(err);
    if (seenStringifiedErrors[stringifiedError]) {
      return;
    }

    seenStringifiedErrors[stringifiedError] = true;
    return handler(err);
  };
}

export class ExtendableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
