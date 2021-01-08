export function getUserAgent(): string {
  return window.navigator.userAgent;
}

export function isDevice(ua: string = getUserAgent()): boolean {
  if (
    ua.match(
      /Android|webOS|iPhone|iPad|iPod|bada|Symbian|Palm|CriOS|BlackBerry|IEMobile|WindowsMobile|Opera Mini/i
    )
  ) {
    return true;
  }

  return false;
}

export function isWebView(): boolean {
  const userAgent = window.navigator.userAgent;
  return (
    /(iPhone|iPod|iPad|Macintosh).*AppleWebKit(?!.*Safari)/i.test(userAgent) ||
    /\bwv\b/.test(userAgent) ||
    /Android.*Version\/(\d)\.(\d)/i.test(userAgent)
  );
}

export function isOperaMini(ua: string = getUserAgent()): boolean {
  return ua.indexOf('Opera Mini') > -1;
}

export function isAndroid(ua: string = getUserAgent()): boolean {
  return /Android/.test(ua);
}

export function isIos(ua: string = getUserAgent()): boolean {
  return /iPhone|iPod|iPad/.test(ua);
}

export function isQQBrowser(ua: string = getUserAgent()): boolean {
  return /QQBrowser/.test(ua);
}

export function isIosWebview(ua: string = getUserAgent()): boolean {
  if (isIos(ua)) {
    return /.+AppleWebKit(?!.*Safari)/.test(ua);
  }
  return false;
}

export function isAndroidWebview(ua: string = getUserAgent()): boolean {
  if (isAndroid(ua)) {
    return /Version\/[\d.]+/.test(ua) && !isOperaMini(ua);
  }
  return false;
}

export function isIE(): boolean {
  if ((window.document as any).documentMode) {
    return true;
  }

  return Boolean(
    window.navigator && // eslint-disable-line compat/compat
    window.navigator.userAgent && // eslint-disable-line compat/compat
      /Edge|MSIE|rv:11/i.test(window.navigator.userAgent) // eslint-disable-line compat/compat
  );
}

export function isIECompHeader(): boolean {
  const mHttp = window.document.querySelector('meta[http-equiv="X-UA-Compatible"]');
  const mContent = window.document.querySelector('meta[content="IE=edge"]');
  if (mHttp && mContent) {
    return true;
  }
  return false;
}

export function isElectron(): boolean {
  if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
    return true;
  }
  return false;
}

export function isIEIntranet(): boolean {
  // This status check only works for older versions of IE with document.documentMode set

  if ((window.document as any).documentMode) {
    try {
      const status = window.status;

      window.status = 'testIntranetMode';

      if (window.status === 'testIntranetMode') {
        window.status = status;

        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  return false;
}

export function isMacOsCna(): boolean {
  const userAgent = getUserAgent();
  return /Macintosh.*AppleWebKit(?!.*Safari)/i.test(userAgent);
}

export function isChrome(ua: string = getUserAgent()): boolean {
  return /Chrome|Chromium|CriOS/.test(ua);
}

export function isSafari(ua: string = getUserAgent()): boolean {
  return /Safari/.test(ua) && !isChrome(ua);
}
