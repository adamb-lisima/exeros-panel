import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpService } from '../service/http/http.service';

interface ErrorLogEntry {
  timestamp: number;
  formattedDate: string;
  count: number;
  fullContent: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorLoggerService implements OnDestroy {
  private readonly isLocalhost: boolean;
  private readonly destroy$ = new Subject<void>();
  private readonly logSubscriptions: Set<any> = new Set();
  private readonly ERROR_STORAGE_KEY = 'error_log_entries';
  private readonly ERROR_RATE_LIMIT_MS = 60000;
  private readonly ERROR_STORAGE_CLEANUP_THRESHOLD = 100;

  constructor(private readonly http: HttpService, private readonly router: Router) {
    this.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.logSubscriptions.forEach(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    });
    this.logSubscriptions.clear();
  }

  private isRateLimited(message: string, formattedContent?: string): boolean {
    try {
      const now = Date.now();
      const formattedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const oldErrorData = this.getOldErrorLogData();

      if (oldErrorData[message] && now - oldErrorData[message] < this.ERROR_RATE_LIMIT_MS) {
        console.warn(`Rate limiting error log (old format): "${message.substring(0, 100)}..."`);

        oldErrorData[message] = now;
        localStorage.setItem('error_log_timestamps', JSON.stringify(oldErrorData));

        this.tryStoreNewFormat(message, formattedContent ?? message, now, formattedDate, 1 + this.getErrorCount(message));

        return true;
      }

      oldErrorData[message] = now;
      localStorage.setItem('error_log_timestamps', JSON.stringify(oldErrorData));

      this.tryStoreNewFormat(message, formattedContent ?? message, now, formattedDate, 1);

      return false;
    } catch (e) {
      console.error('[DEBUG] Error in isRateLimited:', e);
      return false;
    }
  }

  private getOldErrorLogData(): Record<string, number> {
    try {
      const storedData = localStorage.getItem('error_log_timestamps');
      return storedData ? JSON.parse(storedData) : {};
    } catch {
      return {};
    }
  }

  private tryStoreNewFormat(message: string, content: string, timestamp: number, formattedDate: string, count: number): void {
    try {
      let newFormatData: Record<string, ErrorLogEntry> = {};
      try {
        const storedData = localStorage.getItem('error_log_entries');
        if (storedData) {
          newFormatData = JSON.parse(storedData);
        }
      } catch (e) {
        console.error('[DEBUG] Error parsing existing new format data:', e);
      }

      newFormatData[message] = {
        timestamp: timestamp,
        formattedDate: formattedDate,
        count: count,
        fullContent: content
      };

      localStorage.setItem('error_log_entries', JSON.stringify(newFormatData));
    } catch (e) {
      console.error('[DEBUG] Error storing in new format:', e);
    }
  }

  private getErrorCount(message: string): number {
    try {
      const storedData = localStorage.getItem('error_log_entries');
      if (!storedData) return 0;

      const data = JSON.parse(storedData);
      return data[message]?.count ?? 0;
    } catch {
      return 0;
    }
  }

  private getErrorLogData(): Record<string, ErrorLogEntry> {
    try {
      const storedData = localStorage.getItem(this.ERROR_STORAGE_KEY);

      if (!storedData) {
        return {};
      }

      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error('[DEBUG] Error parsing stored data format, attempting conversion:', e);

        const oldData = localStorage.getItem('error_log_timestamps');
        if (oldData) {
          const oldEntries = JSON.parse(oldData);
          const newEntries: Record<string, ErrorLogEntry> = {};

          for (const [key, timestamp] of Object.entries(oldEntries)) {
            const date = new Date(timestamp as number);
            newEntries[key] = {
              timestamp: timestamp as number,
              formattedDate: date.toISOString().replace('T', ' ').substring(0, 19),
              count: 1,
              fullContent: `Converted from old format: ${key}`
            };
          }

          try {
            localStorage.setItem(this.ERROR_STORAGE_KEY, JSON.stringify(newEntries));
            localStorage.removeItem('error_log_timestamps');
          } catch (storageError) {
            console.error('Error updating localStorage during error log format conversion:', storageError);
          }

          return newEntries;
        }
        return {};
      }
    } catch (error) {
      console.error('Error parsing stored error log data:', error);
      return {};
    }
  }

  private cleanupOldErrorEntries(errorLogData: Record<string, ErrorLogEntry>, currentTime: number): void {
    const entries = Object.entries(errorLogData);

    if (entries.length > this.ERROR_STORAGE_CLEANUP_THRESHOLD) {
      const oneDayAgo = currentTime - 24 * 60 * 60 * 1000;

      for (const [key, entry] of entries) {
        if (entry.timestamp < oneDayAgo) {
          delete errorLogData[key];
        }
      }
    }
  }

  logError(message: string, stack?: string, activeElement?: any, componentInfo?: string): void {
    const MAX_LENGTH = 2000;

    const currentUrl = this.router.url ?? 'N/A';
    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;

    let content = `🚨 **Angular Error Logged**\n` + `**Timestamp:** ${timestamp}\n` + `**Route:** \`${currentUrl}\`\n` + `**Message:** ${message}\n` + `**User Agent:** ${userAgent}\n` + `**Active Element:** ${JSON.stringify(activeElement)}\n` + `**Component:** ${componentInfo}\n` + `**Stack:**\n\`\`\`${stack ?? 'N/A'}\`\`\``;

    if (content.length > MAX_LENGTH) {
      const baseInfo = `🚨 **Angular Error Logged**\n` + `**Timestamp:** ${timestamp}\n` + `**Route:** \`${currentUrl}\`\n` + `**Message:** `;
      const messageTrimmed = message?.slice(0, 200) || '';
      const userAgentTrimmed = `**User Agent:** ${userAgent.slice(0, 50)}...\n`;
      const elementInfo = `**Active Element:** ${JSON.stringify(activeElement)}\n**Component:** ${componentInfo}\n`;

      const remainingSpace = MAX_LENGTH - baseInfo.length - messageTrimmed.length - userAgentTrimmed.length - elementInfo.length - 20;
      const stackTrimmed = (stack ?? 'N/A').length > remainingSpace ? (stack ?? 'N/A').slice(0, remainingSpace - 20) + '...' : stack ?? 'N/A';

      content = `${baseInfo}${messageTrimmed}\n` + `${userAgentTrimmed}` + `${elementInfo}` + `**Stack:**\n\`\`\`${stackTrimmed}\`\`\``;
    }

    if (this.isRateLimited(message, content)) {
      return;
    }

    const payload = {
      content: content
    };

    if (!this.isLocalhost) {
      const subscription = this.http
        .post$('v2/log/webhooks', payload)
        .pipe(
          catchError((error: unknown) => {
            console.error('Error logging to webhook:', error);
            return EMPTY;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.logSubscriptions.delete(subscription);
          },
          error: (err: unknown) => {
            console.error('Unhandled error in error logger:', err);
            this.logSubscriptions.delete(subscription);
          },
          complete: () => {
            this.logSubscriptions.delete(subscription);
          }
        });

      this.logSubscriptions.add(subscription);
    }
  }

  public getErrorDetails(): any[] {
    const errorLogData = this.getErrorLogData();
    const result = [];

    for (const [key, entry] of Object.entries(errorLogData)) {
      result.push({
        message: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
        lastSeen: entry.formattedDate,
        occurrences: entry.count,
        fullContent: entry.fullContent
      });
    }

    return result.sort((a, b) => b.occurrences - a.occurrences);
  }
}
