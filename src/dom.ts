import { inlineMemoize, memoize } from './util';

export function urlEncode(str: string): string {
  return str.replace(/\?/g, '%3F').replace(/&/g, '%26').replace(/#/g, '%23').replace(/\+/g, '%2B');
}

export function isDocumentReady(): boolean {
  return Boolean(document.body) && document.readyState === 'complete';
}

export function isDocumentInteractive(): boolean {
  return Boolean(document.body) && document.readyState === 'interactive';
}

export function waitForWindowReady(): Promise<void> {
  return inlineMemoize(waitForWindowReady, () => {
    return new Promise((resolve) => {
      if (isDocumentReady()) {
        resolve();
      }

      window.addEventListener('load', () => resolve());
    });
  });
}

export const waitForDocumentReady = memoize(() => {
  return new Promise<void>((resolve) => {
    if (isDocumentReady() || isDocumentInteractive()) {
      return resolve();
    }

    const interval = setInterval(() => {
      if (isDocumentReady() || isDocumentInteractive()) {
        clearInterval(interval);
        return resolve();
      }
    }, 10);
  });
});

export function waitForDocumentBody(): Promise<HTMLElement> {
  return new Promise((resolve) => {
    if (document.body) {
      // document.body is not always HTMLBodyElement either.
      return resolve(document.body);
    }

    return waitForDocumentReady().then(() => {
      if (document.body) {
        return resolve(document.body);
      }

      throw new Error('Document ready but document.body not present');
    });
  });
}

export function htmlEncode(html: string = ''): string {
  return html
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F');
}
