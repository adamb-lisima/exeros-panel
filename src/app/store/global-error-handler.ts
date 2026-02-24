import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorLoggerService } from './error-logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly injector: Injector) {}

  handleError(error: any): void {
    const logger = this.injector.get(ErrorLoggerService);
    const message = error.message ?? error.toString();
    const stack = error.stack ?? '';

    const activeElement = document.activeElement;
    const clickedElement = activeElement
      ? {
          tag: activeElement.tagName,
          id: activeElement.id,
          class: activeElement.className,
          text: activeElement.textContent?.substring(0, 50)
        }
      : 'unknown';

    let componentInfo = 'unknown';
    if (stack) {
      const stackLines = stack.split('\n');
      for (const line of stackLines) {
        if (line.includes('Component_') || line.includes('.html')) {
          componentInfo = line.trim();
          break;
        }
      }
    }

    logger.logError(message, stack, clickedElement, componentInfo);
  }
}
