// src/app/service/version/version.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private readonly VERSION_STORAGE_KEY = 'app_version';

  checkVersion(apiVersion: string): void {
    const storedVersion = this.getStoredVersion();

    if (!storedVersion) {
      this.storeVersion(apiVersion);
      return;
    }

    if (apiVersion !== storedVersion) {
      this.storeVersion(apiVersion);
      this.refreshWithCacheClearing();
    }
  }

  private getStoredVersion(): string | null {
    return localStorage.getItem(this.VERSION_STORAGE_KEY);
  }

  private storeVersion(version: string): void {
    localStorage.setItem(this.VERSION_STORAGE_KEY, version);
  }

  private refreshWithCacheClearing(): void {
    if (window.caches) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }

    localStorage.removeItem('lastPath');

    const currentLocation = window.location.href;
    window.location.href = currentLocation;
  }
}
