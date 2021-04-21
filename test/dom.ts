import {
  extendUrl,
  getCurrentScriptUID,
  isDocumentInteractive,
  isDocumentReady,
  memoize,
  urlEncode,
  waitForDocumentBody,
  waitForDocumentReady,
  waitForWindowReady
} from '../src';

describe('extend url cases', () => {
  test('should add query parameters to url', () => {
    const query1 = {
      query: {
        bar: 'baz'
      }
    };

    const result1 = extendUrl('http://foo.com', query1);
    const expectedResult1 = 'http://foo.com?bar=baz';

    expect(result1).toBe(expectedResult1);
  });

  test('should add query parameters to url when one is already there', () => {
    const query2 = {
      query: {
        bar: 'baz'
      }
    };

    const result2 = extendUrl('http://foo.com?a=b', query2);
    const expectedResult2 = 'http://foo.com?a=b&bar=baz';

    expect(result2).toBe(expectedResult2);
  });

  test('should add query parameters and hashes to url', () => {
    const query3 = {
      query: {
        bar: 'baz'
      },
      hash: {
        blerp: 'blorp'
      }
    };

    const result3 = extendUrl('http://foo.com', query3);
    const expectedResult3 = 'http://foo.com?bar=baz#blerp=blorp';

    expect(result3).toBe(expectedResult3);
  });

  test('should add query parameters and hashes to url when they already exist', () => {
    const query4 = {
      query: {
        bar: 'baz'
      },
      hash: {
        blerp: 'blorp'
      }
    };

    const result4 = extendUrl('http://foo.com?a=1#hello=goodbye', query4);
    const expectedResult4 = 'http://foo.com?a=1&bar=baz#hello=goodbye&blerp=blorp';

    expect(result4).toBe(expectedResult4);
  });
});

describe('document interactive cases', () => {
  test('should return false when document is not interactive', () => {
    // document.readyState will be equal to 'complete' as it was set to be in the last test
    const result = isDocumentInteractive();

    expect(result).toBe(false);
  });

  test('should return true when document is interactive', () => {
    const oldState = document.readyState;
    // document.readyState is a readonly property, we are using the 'set(ter)' from the last test to change readyState
    (document as any).readyState = 'interactive';

    const result = isDocumentInteractive();
    (document as any).readyState = oldState;

    expect(result).toBe(true);
  });
});

describe('isDocumentReady cases', () => {
  const oldState = document.readyState;

  test('should return false when document is not ready', () => {
    (document as any).readyState = 'loading';
    const result = isDocumentReady();
    (document as any).readyState = oldState;

    expect(result).toBe(false);
  });

  test('should return true when document is ready', () => {
    (document as any).readyState = 'complete';
    const result = isDocumentReady();
    (document as any).readyState = oldState;

    expect(result).toBe(true);
  });
});

describe('url encode cases', () => {
  test('should encode a valid url', () => {
    const url = 'https://example.com/search?q=foo+bar&p=fizz#';
    const result = urlEncode(url);
    const expectedResult = 'https://example.com/search%3Fq=foo%2Bbar%26p=fizz%23';

    expect(result).toBe(expectedResult);
  });
});

describe('waitForDocumentBody cases', () => {
  const oldBody = document.body;
  const testBody = document.createElement('body');

  beforeEach(memoize.clear);

  afterEach(() => {
    document.body = oldBody;
  });

  test('should resolve when body is present', async () => {
    (document as any).readyState = 'complete';
    document.body = testBody;
    const result = await waitForDocumentBody();

    expect(result).toBe(testBody);
  });

  test('should eventully resolve when document is ready', async () => {
    (document as any).readyState = 'loading';
    // document.body = null;
    document.body.remove();

    setTimeout(() => {
      (document as any).readyState = 'complete';
      document.body = testBody;
    }, 20);

    const result = await waitForDocumentBody();
    expect(result).toBe(testBody);
  });
});

describe('waitForDocumentReady cases', () => {
  beforeEach(memoize.clear);
  it('should resolve when document is interactive', async () => {
    try {
      (document as any).readyState = 'interactive';
      await waitForDocumentReady();
    } catch (err) {
      throw new Error('Expected waitForDocumentReady to resolve');
    }
  });

  it('should eventully resolve when document is ready', async () => {
    try {
      (document as any).readyState = 'loading';

      setTimeout(() => {
        (document as any).readyState = 'complete';
      }, 20);

      await waitForDocumentReady();
    } catch (err) {
      throw new Error(
        `Expected waitForDocumentReady to eventully resolve when document is ready: ${err.message}`
      );
    }
  });
});

describe('waitForWindowReady function', () => {
  const oldState = document.readyState;

  afterEach(() => {
    (document as any).readyState = oldState;
  });

  it('should resolve when window ready', async () => {
    try {
      (document as any).readyState = 'complete';
      await waitForWindowReady();
    } catch (err) {
      throw new Error('Expected waitForWindowReady to resolve');
    }
  });

  it('should resolve when window eventually loads', async () => {
    try {
      (document as any).readyState = 'loading';
      setTimeout(() => {
        (document as any).readyState = 'complete';
      }, 500);
      await waitForWindowReady();
    } catch (err) {
      throw new Error('Expected waitForWindowReady to eventually resolve');
    }
  });
});
