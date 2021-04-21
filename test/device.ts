import {
  getUserAgent,
  isAndroid,
  isAndroidWebview,
  isChrome,
  isDevice,
  isElectron,
  isIE,
  isIECompHeader,
  isIEIntranet,
  isIos,
  isIosWebview,
  isMacOsCna,
  isOperaMini,
  isQQBrowser,
  isSafari,
  isWebView
} from '../src/device';

describe('getUserAgent', () => {
  beforeEach(() => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any) = {};
  });
  test('should return value of window.navigator.userAgent', () => {
    const expectedResult = 'userAgent potato';
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = expectedResult;
    const userAgent = getUserAgent();
    expect(userAgent === expectedResult).toBe(true);
  });
});

describe('android', () => {
  beforeEach(() => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any) = {};
  });
  test('should return true when userAgent contains Android', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'Android';
    const bool = isAndroid();
    expect(bool).toBe(true);
  });
  test('should return false when userAgent does NOT contain Android', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'android';
    const bool = isAndroid();
    expect(bool).toBe(false);
  });
});

describe('isAndroidWebview', () => {
  test('should return true when isAndroid function returns true, Version regex test passes, and isOperaMini function returns false', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'AndroidVersion/9';
    const bool = isAndroidWebview();
    expect(bool).toBe(true);
  });
  test('should return false when isAndroid function returns false, ', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'PotatoVersion/9';
    const bool = isAndroidWebview();
    expect(bool).toBe(false);
  });
  test('should return false when isAndroid function returns true, Version regex test passes, and isOperaMini function returns true', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'AndroidVersion/9Opera Mini';
    const bool = isAndroidWebview();
    expect(bool).toBe(false);
  });
  test('should return false when isAndroid function returns true and Version regex test fails', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'AndroidPotato/9';
    const bool = isAndroidWebview();
    expect(bool).toBe(false);
  });
});

describe('isChrome', () => {
  test('should return true when userAgent contains Chrome', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'Chrome';
    const bool = isChrome();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains Chromium', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'Chromium';
    const bool = isChrome();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains CriOS', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'CriOS';
    const bool = isChrome();
    expect(bool).toBe(true);
  });
  test('should return false when userAgent is invalid', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'p0tatO';
    const bool = isChrome();
    expect(bool).toBe(false);
  });
});

describe('isDevice', () => {
  beforeEach(() => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any) = {};
  });
  test('should return true when userAgent contains android(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'android';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains webos(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'webos';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains iphone(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'iphone';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains ipad(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'ipad';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains ipod(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'ipod';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains bada(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'bada';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains symbian(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'symbian';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains palm(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'palm';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains crios(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'crios';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains blackberry(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'blackberry';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains blackberry(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'blackberry';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains iemobile(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'iemobile';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains windowsmobile(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'windowsmobile';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains `opera mini`(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'opera mini';
    const bool = isDevice();
    expect(bool).toBe(true);
  });
  test('should return false when userAgent is NOT a valid choice', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'potato device';
    const bool = isDevice();
    expect(bool).toBe(false);
  });
});

describe('isElectron', () => {
  beforeEach(() => {
    (global.process as any) = {};
    (global.process.versions as any) = {};
  });
  test('should return false when process is undefined', () => {
    global.process = undefined;
    const bool = isElectron();
    if (bool) {
      throw new Error(`Expected false, got ${JSON.stringify(bool)}`);
    }
  });
  test('should return false when process.versions is a falsy value', () => {
    (global.process.versions as any) = false;
    const bool = isElectron();
    if (bool) {
      throw new Error(`Expected false, got ${JSON.stringify(bool)}`);
    }
  });
  test('should return false when process.versions.electron is a falsy value', () => {
    (global.process.versions.electron as any) = false;
    const bool = isElectron();
    if (bool) {
      throw new Error(`Expected false, got ${JSON.stringify(bool)}`);
    }
  });
  test('should return true when process.versions.electron is a truthy value', () => {
    global.process.versions.electron = '1.7.12';
    const bool = isElectron();
    if (!bool) {
      throw new Error(`Expected true, got ${JSON.stringify(bool)}`);
    }
  });
});

describe('isIE', () => {
  beforeEach(() => {
    (window.document as any).documentMode = null;
  });
  test('should return false when window.document.documentMode is a falsy value, and userAgent is an invalid truthy value', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'potato';
    const bool = isIE();
    expect(bool).toBe(false);
  });
  test('should return false when window.document.documentMode is a falsy value, and userAgent is a falsy value', () => {
    const bool = isIE();
    expect(bool).toBe(false);
  });
  test('should return false when window.document.documentMode is a falsy value, and (window.navigator as any) is a falsy value', () => {
    const bool = isIE();
    expect(bool).toBe(false);
  });
  test('should return true when window.document.documentMode is a falsy value and userAgent contains edge(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'edge';
    const bool = isIE();
    expect(bool).toBe(true);
  });
  test('should return true when window.document.documentMode is a falsy value and userAgent contains msie(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'msie';
    const bool = isIE();
    expect(bool).toBe(true);
  });
  test('should return true when window.document.documentMode is a falsy value and userAgent contains rv:11(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'rv:11';
    const bool = isIE();
    expect(bool).toBe(true);
  });
  test('should return true when window.document.documentMode is a truthy value', () => {
    (window.document as any).documentMode = true;
    const bool = isIE();
    expect(bool).toBe(true);
  });
});

describe('isIECompHeader', () => {
  beforeEach(() => {
    window.document.querySelector = () => true;
  });
  test('should return true when both mHttp and mContent are truthy', () => {
    const bool = isIECompHeader();
    expect(bool).toBe(true);
  });
  test('should return false when mHttp is falsy', () => {
    (window.document as any).querySelector = (elem: string) =>
      elem !== 'meta[http-equiv="X-UA-Compatible"]';
    const bool = isIECompHeader();
    expect(bool).toBe(false);
  });
  test('should return false when mContent is falsy', () => {
    (window.document as any).querySelector = (elem: string) => elem !== 'meta[content="IE=edge"]';
    const bool = isIECompHeader();
    expect(bool).toBe(false);
  });
});

describe('isIEIntranet', () => {
  beforeEach(() => {
    (window.document as any).documentMode = true;
    Object.defineProperty(window, 'status', { writable: true });
  });
  test('should return false when window.document.documentMode is a truthy value and window.status does not equal testIntranetMode', () => {
    Object.defineProperty(window, 'status', {
      // returning something in a setter causes window.status to equal undefined when someone sets a value to it
      // eslint-disable-next-line flowtype/no-weak-types
      set(_): any {
        return `potato${_}`;
      } // eslint-disable-line no-setter-return
    });
    const bool = isIEIntranet();
    expect(bool).toBe(false);
  });
  test('should jump to catch block error and return false when there is an error', () => {
    // Doing this will cause an error of writing to a read-only variable
    Object.defineProperty(window, 'status', { writable: false });
    const bool = isIEIntranet();
    expect(bool).toBe(false);
  });
  test('should return false when window.document.documentMode is a falsy value', () => {
    (window.document as any).documentMode = false;
    const bool = isIEIntranet();
    expect(bool).toBe(false);
  });
  test('should return true when window.document.documentMode is a truthy value and window.status gets set to testIntranetMode', () => {
    const bool = isIEIntranet();
    expect(bool).toBe(true);
  });
});

describe('isIos', () => {
  beforeEach(() => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any) = {};
  });
  test('should return true when userAgent contains iPhone', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'iPhone';
    const bool = isIos();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains iPod', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'iPod';
    const bool = isIos();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains iPad', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'iPad';
    const bool = isIos();
    expect(bool).toBe(true);
  });
  test('should return false when userAgent is NOT an IOS', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'iPotato';
    const bool = isIos();
    expect(bool).toBe(false);
  });
});

describe('isIosWebview', () => {
  test('should return true when isIos function returns true, and Applekit regex test passes', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = '.iPhoneAppleWebKit';
    const bool = isIosWebview();
    expect(bool).toBe(true);
  });
  test('should return false when isIos function returns false', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'potatoIOS';
    const bool = isIosWebview();
    expect(bool).toBe(false);
  });
});

describe('isMacOsCna', () => {
  beforeEach(() => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any) = {};
  });
  test('should return true when userAgent is valid', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'macintosh.potatoAppleWebKit';
    const bool = isMacOsCna();
    expect(bool).toBe(true);
  });
  test('should return false when userAgent is invalid', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'potat0';
    const bool = isMacOsCna();
    expect(bool).toBe(false);
  });
});
describe('isOperaMini', () => {
  beforeEach(() => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any) = {};
  });
  test('should return true when userAgent contains `Opera Mini`', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'Opera Mini';
    const bool = isOperaMini();
    expect(bool).toBe(true);
  });
  test('should return false when userAgent does NOT contain `Opera Mini`', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'Potato Mini';
    const bool = isOperaMini();
    expect(bool).toBe(false);
  });
});

describe('isQQBrowser', () => {
  test('should return true when userAgent contains QQBrowser', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'QQBrowser';
    const bool = isQQBrowser();
    expect(bool).toBe(true);
  });
  test('should return false when userAgent does NOT contain QQBrowser', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'QQPotato';
    const bool = isQQBrowser();
    expect(bool).toBe(false);
  });
});

describe('isSafari', () => {
  test('should return true when userAgent contains Safari and isChrome function returns false', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'Safari';
    const bool = isSafari();
    expect(bool).toBe(true);
  });
  test('should return false when userAgent contains Safari and isChrome function returns true', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'SafariChrome';
    const bool = isSafari();
    expect(bool).toBe(false);
  });
  test('should return false when userAgent does NOT contain Safari', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'potato';
    const bool = isSafari();
    expect(bool).toBe(false);
  });
});

describe('isWebView', () => {
  beforeEach(() => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any) = {};
  });
  test('should return false when userAgent is invalid', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'invalid potato';
    const bool = isWebView();
    expect(bool).toBe(false);
  });
  test('should return true when userAgent is valid and begins with iPhone or iPod or iPad or Macintosh(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'ipod.potatoAppleWebKit.potato';
    const bool = isWebView();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent contains whole word wv', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'wv';
    const bool = isWebView();
    expect(bool).toBe(true);
  });
  test('should return true when userAgent is valid and starts with android(case insensitive)', () => {
    // eslint-disable-next-line compat/compat
    (window.navigator as any).userAgent = 'android.potatoVersion/9.3';
    const bool = isWebView();
    expect(bool).toBe(true);
  });
});
