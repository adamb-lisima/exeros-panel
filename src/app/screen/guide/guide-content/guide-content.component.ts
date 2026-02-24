import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GuideActions } from '../guide.actions';
import { GuideContent } from '../guide.model';
import { selectContent, selectError, selectIsLoading } from '../guide.selectors';
import { GuideService } from '../guide.service';

@Component({
  selector: 'app-guide-content',
  templateUrl: './guide-content.component.html',
  styles: [
    `
      ::ng-deep .guide-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        text-align: justify;
        max-width: 90ch;
        margin: 0 auto;
      }

      ::ng-deep .guide-content h1,
      ::ng-deep .guide-content h2,
      ::ng-deep .guide-content h3,
      ::ng-deep .guide-content h4,
      ::ng-deep .guide-content h5 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        text-align: left;
      }

      ::ng-deep .guide-content h1 {
        font-size: 2em;
      }
      ::ng-deep .guide-content h2 {
        font-size: 1.5em;
      }
      ::ng-deep .guide-content h3 {
        font-size: 1.25em;
      }
      ::ng-deep .guide-content h4 {
        font-size: 1em;
      }
      ::ng-deep .guide-content h5 {
        font-size: 0.875em;
      }

      ::ng-deep .guide-content p {
        margin-top: 0;
        margin-bottom: 16px;
      }

      ::ng-deep .guide-content ul,
      ::ng-deep .guide-content ol {
        margin-top: 0;
        margin-bottom: 16px;
        padding-left: 2em;
        text-align: left;
      }

      ::ng-deep .guide-content ul {
        list-style-type: disc;
      }
      ::ng-deep .guide-content ol {
        list-style-type: decimal;
      }

      ::ng-deep .guide-content li {
        margin-bottom: 8px;
      }

      ::ng-deep .guide-content li > ul,
      ::ng-deep .guide-content li > ol {
        margin-top: 8px;
        margin-bottom: 0;
      }

      ::ng-deep .guide-content strong {
        font-weight: bold;
      }
      ::ng-deep .guide-content em {
        font-style: italic;
      }
      ::ng-deep .guide-content u {
        text-decoration: underline;
      }
      ::ng-deep .guide-content del {
        text-decoration: line-through;
      }
      ::ng-deep .guide-content a {
        color: #0066cc;
        text-decoration: none;
      }
      ::ng-deep .guide-content a:hover {
        text-decoration: underline;
      }
      ::ng-deep .guide-content code {
        font-family: monospace;
        background-color: #f5f5f5;
        padding: 2px 4px;
        border-radius: 3px;
      }
      ::ng-deep .guide-content blockquote {
        margin: 0;
        padding-left: 1em;
        border-left: 4px solid #ddd;
        color: #666;
      }

      ::ng-deep .media-container {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }

      ::ng-deep .media-container img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    `
  ]
})
export class GuideContentComponent implements OnInit, OnDestroy {
  content$!: Observable<GuideContent | null>;
  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  isNotLoading$!: Observable<boolean>;
  hasNoError$!: Observable<boolean>;
  showContent$!: Observable<boolean>;

  apiUrl = 'https://cms.vidematics.cloud';

  prevSlug: string | null = null;
  nextSlug: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly route: ActivatedRoute, private readonly router: Router, private readonly guideService: GuideService, private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.content$ = this.store.select(selectContent);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.error$ = this.store.select(selectError);

    this.isNotLoading$ = this.isLoading$.pipe(map(isLoading => isLoading === false));
    this.hasNoError$ = this.error$.pipe(map(error => error === null));

    this.showContent$ = combineLatest([this.isNotLoading$, this.hasNoError$, this.content$.pipe(map(content => content !== null))]).pipe(map(([notLoading, noError, hasContent]) => notLoading && noError && hasContent));

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params.slug) {
        const slug = params.slug;
        this.store.dispatch(GuideActions.setActiveSlug({ slug }));
        this.store.dispatch(GuideActions.loadGuideContent({ slug }));

        this.guideService
          .getAdjacentSlugs(slug)
          .pipe(takeUntil(this.destroy$))
          .subscribe(adjacent => {
            this.prevSlug = adjacent.prev;
            this.nextSlug = adjacent.next;
          });
      }
    });
  }

  formatMarkdown(text: string): SafeHtml {
    if (!text) return '';

    const lines = text.split('\n');
    const result: string[] = [];

    let inList = false;
    let listType = '';
    let listItems: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (line === '') {
        if (inList) {
          if (listType === 'ul') {
            result.push('<ul>' + listItems.join('') + '</ul>');
          } else if (listType === 'ol') {
            result.push('<ol>' + listItems.join('') + '</ol>');
          }
          inList = false;
          listItems = [];
        }
        continue;
      }

      if (line.startsWith('#####')) {
        result.push('<h5>' + this.formatInline(line.substring(5).trim()) + '</h5>');
        continue;
      } else if (line.startsWith('####')) {
        result.push('<h4>' + this.formatInline(line.substring(4).trim()) + '</h4>');
        continue;
      } else if (line.startsWith('###')) {
        result.push('<h3>' + this.formatInline(line.substring(3).trim()) + '</h3>');
        continue;
      } else if (line.startsWith('##')) {
        result.push('<h2>' + this.formatInline(line.substring(2).trim()) + '</h2>');
        continue;
      } else if (line.startsWith('#')) {
        result.push('<h1>' + this.formatInline(line.substring(1).trim()) + '</h1>');
        continue;
      }

      if (line.startsWith('- ')) {
        if (!inList || listType !== 'ul') {
          if (inList) {
            if (listType === 'ol') {
              result.push('<ol>' + listItems.join('') + '</ol>');
            }
            listItems = [];
          }
          inList = true;
          listType = 'ul';
        }
        listItems.push('<li>' + this.formatInline(line.substring(2).trim()) + '</li>');
        continue;
      }

      const olMatch = line.match(/^(\d+)\.\s(.+)$/);
      if (olMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) {
            if (listType === 'ul') {
              result.push('<ul>' + listItems.join('') + '</ul>');
            }
            listItems = [];
          }
          inList = true;
          listType = 'ol';
        }
        listItems.push('<li>' + this.formatInline(olMatch[2].trim()) + '</li>');
        continue;
      }

      if (!inList) {
        result.push('<p>' + this.formatInline(line) + '</p>');
      } else {
        if (listType === 'ul') {
          result.push('<ul>' + listItems.join('') + '</ul>');
        } else if (listType === 'ol') {
          result.push('<ol>' + listItems.join('') + '</ol>');
        }
        inList = false;
        listItems = [];
        result.push('<p>' + this.formatInline(line) + '</p>');
      }
    }

    if (inList) {
      if (listType === 'ul') {
        result.push('<ul>' + listItems.join('') + '</ul>');
      } else if (listType === 'ol') {
        result.push('<ol>' + listItems.join('') + '</ol>');
      }
    }

    return this.sanitizer.bypassSecurityTrustHtml(result.join('\n'));
  }

  formatInline(text: string): string {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

    return text;
  }

  navigateToPage(slug: string | null): void {
    if (slug) {
      this.router.navigate(['/guide', slug]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
