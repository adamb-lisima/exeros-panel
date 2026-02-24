import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GuideContent, GuideMenuItem, StrapiCollectionResponse } from './guide.model';

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private readonly apiUrl = environment.guideApiUrl;
  private readonly token = environment.guideApiToken;

  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.token}`
  });

  constructor(private readonly http: HttpClient) {}

  getMenu(): Observable<GuideMenuItem[]> {
    return this.http.get<StrapiCollectionResponse<GuideMenuItem>>(`${this.apiUrl}/api/articles?populate=*`, { headers: this.headers }).pipe(
      map(response => response.data ?? []),
      catchError(error => {
        console.error('Error fetching menu:', error);
        return of([]);
      })
    );
  }

  getContent(slug: string): Observable<GuideContent | null> {
    return this.http.get<StrapiCollectionResponse<GuideContent>>(`${this.apiUrl}/api/articles?filters[slug][$eq]=${slug}&populate[blocks][populate]=*`, { headers: this.headers }).pipe(
      map(response => {
        if (!response.data || response.data.length === 0) {
          return null;
        }
        return response.data[0];
      }),
      catchError(error => {
        console.error(`Error fetching content for ${slug}:`, error);
        return of(null);
      })
    );
  }

  getAdjacentSlugs(currentSlug: string): Observable<{ prev: string | null; next: string | null }> {
    return this.getMenu().pipe(
      map(items => {
        if (!items || items.length === 0) {
          return { prev: null, next: null };
        }

        const sortedItems = [...items].sort((a, b) => a.id - b.id);
        const currentIndex = sortedItems.findIndex(item => item.slug === currentSlug);

        if (currentIndex === -1) {
          return { prev: null, next: null };
        }

        const prev = currentIndex > 0 ? sortedItems[currentIndex - 1].slug : null;

        const next = currentIndex < sortedItems.length - 1 ? sortedItems[currentIndex + 1].slug : null;

        return { prev, next };
      })
    );
  }
}
