import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpRequestHeaders, HttpResponse } from 'src/app/service/http/http.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpService {
  constructor(private readonly http: HttpClient) {}

  private static fullPath(path: string): string {
    try {
      return new URL(path).toString();
    } catch (e) {
      return `${environment.baseUrl}/${path}`;
    }
  }

  get$<T = HttpResponse<any>>(url: string, params: object = {}, headers: HttpRequestHeaders = {}): Observable<T> {
    return this.http.get<T>(HttpService.fullPath(url), { params: this.getHttpParams(params), headers });
  }

  getFile$(url: string, params: object = {}, headers: HttpRequestHeaders = {}): Observable<any> {
    return this.http.get(HttpService.fullPath(url), { params: this.getHttpParams(params), responseType: 'blob', observe: 'response', ...headers }).pipe(
      tap(response => {
        if (response.body) {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(response.body);
          a.target = '_blank';
          const disposition = response.headers.get('Content-Disposition');
          if (disposition) {
            const split = disposition.split('=');
            a.download = split[split.length - 1].replace(/(^"|"$)/g, '');
          }
          a.click();
          a.remove();
        }
      })
    );
  }

  postFile$(url: string, body: object = {}, headers: HttpRequestHeaders = {}): Observable<any> {
    return this.http.post(HttpService.fullPath(url), body, { responseType: 'blob', observe: 'response', ...headers }).pipe(
      tap(response => {
        if (response.body) {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(response.body);
          a.target = '_blank';
          const disposition = response.headers.get('Content-Disposition');
          if (disposition) {
            const split = disposition.split('=');
            a.download = split[split.length - 1].replace(/(^"|"$)/g, '');
          }
          a.click();
          a.remove();
        }
      })
    );
  }

  post$<T = HttpResponse<any>, B = object>(url: string, body: B, params: object = {}, headers: HttpRequestHeaders = {}): Observable<T> {
    return this.http.post<T>(HttpService.fullPath(url), body, { params: this.getHttpParams(params), headers });
  }

  put$<T = HttpResponse<any>, B = object>(url: string, body: B, params: object = {}, headers: HttpRequestHeaders = {}): Observable<T> {
    return this.http.put<T>(HttpService.fullPath(url), body, { params: this.getHttpParams(params), headers });
  }

  delete$<T = HttpResponse<any>>(url: string, params: object = {}, headers: HttpRequestHeaders = {}): Observable<unknown> {
    return this.http.delete<T>(HttpService.fullPath(url), { params: this.getHttpParams(params), headers });
  }

  private getHttpParams(params: object): HttpParams {
    return Object.entries(params).reduce((prev, curr) => {
      const [key, value] = curr;
      if (Array.isArray(value)) {
        value.forEach((p: string | number) => (prev = prev.append(key, String(p))));
      } else if (value !== undefined && String(value).length > 0) {
        prev = prev.append(key, String(value));
      }
      return prev;
    }, new HttpParams());
  }
}
