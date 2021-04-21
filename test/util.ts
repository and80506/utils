import {
  isPromise,
  isDefined,
  isRegex,
  isWeakMap,
  identity,
  extend,
  dotify,
  undotify,
  domainMatches,
  memoize,
  inlineMemoize,
  once,
  base64encode,
  base64decode,
  stringifyErrorMessage
} from '../src/util';

describe('isPromise', () => {
  test('should be true', () => {
    expect(isPromise(new Promise(() => {}))).toBe(true);
  });
  test('should be false', () => {
    expect(isPromise(() => {})).toBe(false);
  });
});

describe('isDefined', () => {
  test('should be true', () => {
    expect(isDefined('undefined')).toBe(true);
  });
  test('should be false', () => {
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(null)).toBe(false);
  });
});

describe('domainMatches', () => {
  test('should return true when domain matches', () => {
    const domain = 'paypal.com';
    const hostNames = [
      'https://www.paypal.com',
      'file://www.paypal.com',
      'anything://anything.paypal.com'
    ];
    const results = hostNames.map((hostname) => domainMatches(hostname, domain));
    const expectedResult = true;
    results.every((result) => {
      expect(result === expectedResult).toBe(true);
    });
  });

  test('should return false when domain does not match', () => {
    const domain = 'paypal.com';
    const hostNames = [
      'https://www.paypal.com/',
      'file://www.anything.com',
      'anything://anything.paypal.co.uk'
    ];
    const results = hostNames.map((hostname) => domainMatches(hostname, domain));
    const expectedResult = false;
    results.every((result) => {
      expect(result === expectedResult).toBe(true);
    });
  });
});

describe('isRegex', () => {
  test('should return true when item is a regex', () => {
    const bool = isRegex(/hi/);
    expect(bool).toBe(true);
  });

  test('should return false when item is NOT a regex', () => {
    const bool = isRegex('hi');
    expect(bool).toBe(false);
  });
});

describe('isWeakMap', () => {
  test('should return true', () => {
    const bool = isWeakMap(new WeakMap());
    expect(bool).toBe(true);
  });

  test('should return false', () => {
    const bool = isWeakMap('hi');
    expect(bool).toBe(false);
  });
});

describe('identity', () => {
  test('should return the same value as argument passed', () => {
    const args = [null, undefined, '', 0, 22, 'hello'];
    args.forEach((arg) => {
      expect(identity(arg) === arg).toBe(true);
    });
    const someObj = { a: 'a' };
    expect(identity(someObj) === someObj).toBe(true);
  });
});

describe('extend cases', () => {
  test('should add keys from one object to another', () => {
    const obj1: Object = {
      foo: 1,
      bar: 2,
      baz: 3
    };

    const obj2: Object = {
      blep: 4,
      blop: 5,
      bloop: 6
    };

    extend(obj1, obj2);

    //
    expect((obj1 as any).blep).toBe(4);
    expect((obj1 as any).blop).toBe(5);
    expect((obj1 as any).bloop).toBe(6);
  });
});

describe('dotify cases', () => {
  test('should dotify and undotify to give the same result', () => {
    const data = {
      foo: 'bar',
      baz: [1, 2, 3],
      bing: ['aaa', 'bbb', 'ccc'],
      bong: [{ a: 1 }, { b: 2 }, { c: 3 }],
      nested: {
        obj: {
          blerf: 'foobar',
          blorf: 555
        },
        zorg: 'zerg',
        berk: 'me,erk'
      }
    };

    const dotified = dotify(data);
    const undotified = undotify(dotified);

    expect(JSON.stringify(data) === JSON.stringify(undotified)).toBe(true);
  });
});

describe('memoize cases', () => {
  test('should create a memoized function', () => {
    let counter = 0;

    const add = memoize(() => {
      counter += 1;
    });

    add();
    add();
    add();
    add();
    add();

    expect(counter).toBe(1);
  });

  test('should create a memoized function with a parameter', () => {
    let counter = 0;

    const add = memoize((number: number) => {
      counter += number;
    });

    add(1);
    add(2);
    add(2);
    add(3);
    add(3);
    add(3);

    expect(counter).toBe(6);
  });

  test('should create a memoized function, and reset', () => {
    let counter = 0;

    const add = memoize(() => {
      counter += 1;
    });

    add();
    add();
    add.reset();
    add();
    add();
    add.reset();
    add();
    add();
    add();

    expect(counter).toBe(3);
  });

  test('should create a memoized function with a parameter, and reset', () => {
    let counter = 0;

    const add = memoize((number: number) => {
      counter += number;
    });

    add(1);
    add(2);
    add.reset();
    add(2);
    add(2);
    add(3);
    add.reset();
    add(3);
    add(3);

    expect(counter).toBe(11);
  });

  test('should create a memoized function, and clear', () => {
    let counter = 0;

    const add = memoize(() => {
      counter += 1;
    });

    add();
    add();
    memoize.clear();
    add();
    add();
    memoize.clear();
    add();
    add();
    add();

    expect(counter).toBe(3);
  });

  test('should create a memoized function with a parameter, and clear', () => {
    let counter = 0;

    const add = memoize((number: number) => {
      counter += number;
    });

    add(1);
    add(2);
    memoize.clear();
    add(2);
    add(2);
    add(3);
    memoize.clear();
    add(3);
    add(3);

    expect(counter).toBe(11);
  });

  test('should create multiple memoized functions, and reset one', () => {
    let counter = 0;

    const add = memoize(() => {
      counter += 1;
    });

    const addAgain = memoize(() => {
      counter += 1;
    });

    add();
    addAgain();
    add();
    addAgain();
    add.reset();
    add();
    addAgain();
    add();
    addAgain();
    add.reset();
    add();
    addAgain();
    add();
    addAgain();
    add();
    addAgain();

    expect(counter).toBe(4);
  });

  test('should create a self-memoized function', () => {
    let counter = 0;

    const add = (): number => {
      return inlineMemoize(add, () => {
        counter += 1;
        return counter;
      });
    };

    add();
    add();
    add();
    add();
    add();

    expect(counter).toBe(1);
  });

  test('should create a self-memoized function with a parameter', () => {
    let counter = 0;

    const add = (number: number): number => {
      return inlineMemoize(
        add,
        () => {
          counter += number;
          return counter;
        },
        [number]
      );
    };

    add(1);
    add(2);
    add(2);
    add(3);
    add(3);
    add(3);

    expect(counter).toBe(6);
  });

  test('should create a self-memoized function and call recursively', () => {
    let counter = 0;

    const add = (): number => {
      return inlineMemoize(add, () => {
        counter += 1;
        if (counter === 1) {
          add();
        }
        return counter;
      });
    };

    add();

    expect(counter).toBe(2);
  });

  test('should create a memoized function with cache based on this', () => {
    let counter = 0;

    const add = memoize(
      () => {
        counter += 1;
      },
      { thisNamespace: true }
    );

    const obj1 = { name: 'obj1' };
    const obj2 = { name: 'obj2' };

    add.call(obj1);
    add.call(obj1);
    add.call(obj1);
    add.call(obj1);

    add.call(obj2);
    add.call(obj2);
    add.call(obj2);
    add.call(obj2);

    expect(counter).toBe(2);
  });

  test('should create a memoized function with cache based on this and a parameter', () => {
    let counter = 0;

    const add = memoize(
      (number: number) => {
        counter += number;
      },
      { thisNamespace: true }
    );

    const obj1 = { name: 'obj1' };
    const obj2 = { name: 'obj2' };

    add.call(obj1, 1);
    add.call(obj1, 2);
    add.call(obj1, 2);
    add.call(obj1, 3);
    add.call(obj1, 3);
    add.call(obj1, 3);

    add.call(obj2, 1);
    add.call(obj2, 2);
    add.call(obj2, 2);
    add.call(obj2, 3);
    add.call(obj2, 3);
    add.call(obj2, 3);

    expect(counter).toBe(12);
  });

  test('should create a memoized function with cache based on this, and reset the cache', () => {
    let counter = 0;

    const add = memoize(
      () => {
        counter += 1;
      },
      { thisNamespace: true }
    );

    const obj1 = { name: 'obj1' };
    const obj2 = { name: 'obj2' };

    add.call(obj1);
    add.call(obj1);

    add.reset();

    add.call(obj1);
    add.call(obj1);

    add.call(obj2);
    add.call(obj2);

    add.reset();

    add.call(obj2);
    add.call(obj2);

    expect(counter).toBe(4);
  });

  test('should create a memoized function with cache based on this and a parameter, and reset the cache', () => {
    let counter = 0;

    const add = memoize(
      (number: number) => {
        counter += number;
      },
      { thisNamespace: true }
    );

    const obj1 = { name: 'obj1' };
    const obj2 = { name: 'obj2' };

    add.call(obj1, 1);
    add.call(obj1, 2);
    add.reset();
    add.call(obj1, 2);
    add.call(obj1, 3);
    add.reset();
    add.call(obj1, 3);
    add.call(obj1, 3);

    add.reset();

    add.call(obj2, 1);
    add.call(obj2, 2);
    add.reset();
    add.call(obj2, 2);
    add.call(obj2, 3);
    add.reset();
    add.call(obj2, 3);
    add.call(obj2, 3);

    expect(counter).toBe(22);
  });

  test('should create a memoized function with cache based on this, and clear the cache', () => {
    let counter = 0;

    const add = memoize(
      () => {
        counter += 1;
      },
      { thisNamespace: true }
    );

    const obj1 = { name: 'obj1' };
    const obj2 = { name: 'obj2' };

    add.call(obj1);
    add.call(obj1);

    memoize.clear();

    add.call(obj1);
    add.call(obj1);

    add.call(obj2);
    add.call(obj2);

    memoize.clear();

    add.call(obj2);
    add.call(obj2);

    expect(counter).toBe(4);
  });

  test('should create a memoized function with cache based on this and a parameter, and clear the cache', () => {
    let counter = 0;

    const add = memoize(
      (number: number) => {
        counter += number;
      },
      { thisNamespace: true }
    );

    const obj1 = { name: 'obj1' };
    const obj2 = { name: 'obj2' };

    add.call(obj1, 1);
    add.call(obj1, 2);
    memoize.clear();
    add.call(obj1, 2);
    add.call(obj1, 3);
    memoize.clear();
    add.call(obj1, 3);
    add.call(obj1, 3);

    memoize.clear();

    add.call(obj2, 1);
    add.call(obj2, 2);
    memoize.clear();
    add.call(obj2, 2);
    add.call(obj2, 3);
    memoize.clear();
    add.call(obj2, 3);
    add.call(obj2, 3);

    expect(counter).toBe(22);
  });
});

describe('once cases', () => {
  test('should create a one time function', () => {
    let counter = 0;

    const add = once(() => {
      counter += 1;
    });

    add();
    add();
    add();
    add();
    add();

    expect(counter).toBe(1);
  });
});

describe('serialization cases', () => {
  function encodedecode(input: string) {
    const encoded = base64encode(input);
    const decoded = base64decode(encoded);

    expect(input === decoded).toBe(true);
  }

  test('should base64 encode and decode basic strings', () => {
    encodedecode('basic');
  });

  test('should base64 encode and decode JSON strings', () => {
    const data = JSON.stringify({
      foo: 'bar',
      baz: [1, 2, 3],
      bing: ['aaa', 'bbb', 'ccc'],
      bong: [{ a: 1 }, { b: 2 }, { c: 3 }],
      nested: {
        obj: {
          blerf: 'foobar',
          blorf: 555
        },
        zorg: 'zerg',
        berk: 'me,erk'
      }
    });

    encodedecode(data);
  });

  test('should base64 encode and decode unicode strings', () => {
    const cases = ['Привет! Это наш тест', 'Tişört ve bluz'];

    cases.forEach(encodedecode);
  });
});

describe('stringifyErrorMessage', () => {
  test('should return default error message when argument is falsy', () => {
    const defaultMessage = `<unknown error: ${Object.prototype.toString.call(undefined)}>`;
    const message = stringifyErrorMessage(undefined);
    expect(message).toBe(defaultMessage);
  });

  test('should return message field if Error instance is passed', () => {
    const expectedMessage = 'Hello';
    const message = stringifyErrorMessage(new Error(expectedMessage));
    expect(message).toBe(expectedMessage);
  });

  test('should return default message if Error instance without a message is passed', () => {
    const error = new Error();
    const expectedMessage = `<unknown error: ${Object.prototype.toString.call(error)}>`;
    const message = stringifyErrorMessage(error);
    expect(message).toBe(expectedMessage);
  });

  test('should return message field of any non-Error object argument is passed', () => {
    const error = { message: 'Hello' };
    const expectedMessage = 'Hello';
    const message = stringifyErrorMessage(error);
    expect(message).toBe(expectedMessage);
  });

  test('should return default message if argument passed has a empty string message field', () => {
    const error = { message: '' };
    const expectedMessage = `<unknown error: ${Object.prototype.toString.call(error)}>`;
    const message = stringifyErrorMessage(error);
    expect(message).toBe(expectedMessage);
  });

  test('should return default message if a primitive argument is passed or argument has non-string value in message field', () => {
    const error = 42;
    const expectedMessage = `<unknown error: ${Object.prototype.toString.call(error)}>`;
    const message = stringifyErrorMessage(error);
    expect(message).toBe(expectedMessage);
  });
});
