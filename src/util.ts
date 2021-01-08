interface FunctionWithNameProperty extends Function {
  __name__?: string;
  displayName?: string;
}

export function getFunctionName(fn: FunctionWithNameProperty): string {
  return fn.name || fn.__name__ || fn.displayName || 'anonymous';
}

export function setFunctionName(fn: Function, name: string): FunctionWithNameProperty {
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

export function isRegex(regx: any): boolean {
  return Object.prototype.toString.call(regx) === '[object RegExp]';
}

export function isWeakMap(wk: any): boolean {
  return Object.prototype.toString.call(wk) === '[object WeakMap]';
}

export function getEmptyObject(): {} {
  return {};
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

function serializeArgs(args: any[]): string {
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

export type Memoized<F> = F & { reset: () => void };

export function memoize<T extends Function>(
  method: T,
  options: MemoizeOptions = getDefaultMemoizeOptions()
): Memoized<T> {
  const { thisNamespace = false, time: cacheTime } = options;

  let simpleCache: { [key: string]: any };
  let thisCache: WeakMap<Object, any>;

  const memoizeFunction = function memoizeFunction(...args: any[]) {
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

  memoizeFunction.reset = () => {
    simpleCache = null;
    thisCache = null;
  };

  const result = memoizeFunction;

  return setFunctionName(
    result,
    `${options.name || getFunctionName(method)}::memoized`
  ) as Memoized<T>;
}

interface FunctionWithMemoizeProperty<T> {
  (...args: any[]): T;
  __inline_memoize_cache?: { [key: string]: T };
}

export function inlineMemoize<T>(
  method: FunctionWithMemoizeProperty<T>,
  logic: (...args: any[]) => T,
  args: any[] = []
): T {
  const cache = (method.__inline_memoize_cache = method.__inline_memoize_cache || {});
  const key = serializeArgs(args);

  if (cache.hasOwnProperty(key)) {
    return cache[key];
  }

  const result = (cache[key] = logic(...args));

  return result;
}
