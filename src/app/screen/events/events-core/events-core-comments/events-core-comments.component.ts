import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, distinctUntilChanged, map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TextareaControlComponent } from '../../../../shared/component/control/textarea-control/textarea-control.component';
import { UsersTreeElement } from '../../../../store/common-objects/common-objects.model';
import { CommonObjectsService } from '../../../../store/common-objects/common-objects.service';
import { waitOnceForAction } from '../../../../util/operators';
import { EventsActions } from '../../events.actions';
import { CommentEventBody } from '../../events.model';
import { EventsSelectors } from '../../events.selectors';

interface KudosToggledEvent extends Event {
  detail: {
    eventId: string | number;
  };
}

@Component({
  selector: 'app-events-core-comments',
  templateUrl: './events-core-comments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
    `
  ]
})
export class EventsCoreCommentsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly boundKudosHandler: any;

  private extractMentions(text: string): number[] {
    const mentions = new Set<number>();
    const regex = /@([^@\s]+)(?:\s|$)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const mentionedName = match[1].trim();
      const user = this.users.find(u => u.name === mentionedName);
      if (user) {
        mentions.add(user.id);
      }
    }

    return Array.from(mentions);
  }

  @ViewChild('commentInput') commentInput?: ElementRef<TextareaControlComponent>;

  event$ = this.store.select(EventsSelectors.event);
  bodyGroup = this.fb.group<Nullable<CommentEventBody>>({
    comment: undefined,
    status: undefined
  });

  private users: UsersTreeElement[] = [];
  private readonly searchTerm = new BehaviorSubject<string>('');
  showUsersList = new BehaviorSubject<boolean>(false);
  cursorPosition = 0;
  activeIndex = 0;

  filteredUsers$ = this.searchTerm.pipe(
    distinctUntilChanged(),
    map(term => this.users.filter(user => user.name.toLowerCase().includes(term.toLowerCase()) || user.email.toLowerCase().includes(term.toLowerCase())))
  );

  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly fb: FormBuilder, private readonly cdr: ChangeDetectorRef, private readonly commonObjectsService: CommonObjectsService) {
    this.boundKudosHandler = this.handleKudosToggled.bind(this);
  }

  handleKudosToggled(event: Event): void {
    this.store.dispatch(EventsActions.toggleKudos());
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const usersList = document.querySelector('.users-list');
    const textarea = document.querySelector('textarea');

    if (usersList && !usersList.contains(clickedElement) && clickedElement !== textarea) {
      this.showUsersList.next(false);
      this.cdr.detectChanges();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey() {
    this.showUsersList.next(false);
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.loadUsers();
    this.loadKudosButtonScript();
    window.addEventListener('kudos-toggled', this.boundKudosHandler as EventListener);
  }

  private loadKudosButtonScript() {
    if (!customElements.get('vue-kudos-button')) {
      const script = document.createElement('script');

      script.src = 'assets/vue-widget.js';

      script.type = 'module';
      script.onload = () => {
        this.cdr.detectChanges();
      };

      document.head.appendChild(script);
    }
  }

  private loadUsers() {
    this.commonObjectsService
      .fetchUsersTree({})
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.users = response.data;
        this.cdr.detectChanges();
      });
  }

  handleInput(event: any) {
    const textarea = event.target.querySelector('textarea') ?? event.target;
    this.cursorPosition = textarea.selectionStart;
    const text = textarea.value;

    const lastAtSymbol = text.lastIndexOf('@', this.cursorPosition);
    if (lastAtSymbol !== -1) {
      const textAfterAt = text.slice(lastAtSymbol + 1, this.cursorPosition);
      if (!textAfterAt.includes(' ')) {
        this.searchTerm.next(textAfterAt);
        this.showUsersList.next(true);
        this.activeIndex = 0;
        return;
      }
    }

    this.showUsersList.next(false);
  }

  handleKeyDown(event: KeyboardEvent) {
    const text = this.bodyGroup.get('comment')?.value ?? '';
    const textarea = event.target as HTMLTextAreaElement;
    const cursorPosition = textarea.selectionStart;

    if (this.showUsersList.value) {
      const users = this.users.filter(user => user.name.toLowerCase().includes(this.searchTerm.value.toLowerCase()) || user.email.toLowerCase().includes(this.searchTerm.value.toLowerCase()));

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.activeIndex = Math.min(this.activeIndex + 1, users.length - 1);
          this.scrollActiveIntoView();
          return;
        case 'ArrowUp':
          event.preventDefault();
          this.activeIndex = Math.max(this.activeIndex - 1, 0);
          this.scrollActiveIntoView();
          return;
        case 'Enter':
          event.preventDefault();
          if (users[this.activeIndex]) {
            this.selectUser(users[this.activeIndex]);
          }
          return;
        case 'Escape':
          event.preventDefault();
          this.showUsersList.next(false);
          return;
      }
    }

    if (event.key === 'Backspace' || event.key === 'Escape') {
      const beforeCursor = text.slice(0, cursorPosition);
      const afterCursor = text.slice(cursorPosition);

      const lastAtIndex = beforeCursor.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const afterAt = beforeCursor.slice(lastAtIndex);

        const isMention = this.users.some(user => {
          const mention = `@${user.name} `;
          return afterAt === mention;
        });

        if (isMention) {
          event.preventDefault();
          const newValue = beforeCursor.slice(0, lastAtIndex) + afterCursor;
          this.bodyGroup.patchValue({ comment: newValue });

          requestAnimationFrame(() => {
            textarea.setSelectionRange(lastAtIndex, lastAtIndex);
            this.cursorPosition = lastAtIndex;
          });
        }
      }
    }
  }

  private scrollActiveIntoView() {
    requestAnimationFrame(() => {
      const activeElement = document.querySelector('.users-list .bg-neutral-50');
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  selectUser(user: UsersTreeElement) {
    const currentValue = this.bodyGroup.get('comment')?.value ?? '';
    const lastAtSymbol = currentValue.lastIndexOf('@', this.cursorPosition);

    if (lastAtSymbol === -1) return;

    const beforeAt = currentValue.slice(0, lastAtSymbol);
    const afterCursor = currentValue.slice(this.cursorPosition);

    const newValue = `${beforeAt}@${user.name} ${afterCursor}`;

    this.bodyGroup.patchValue({ comment: newValue });
    this.showUsersList.next(false);

    requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
      this.cdr.detectChanges();
    });
  }

  handleSendClick(): void {
    const comment = this.bodyGroup.get('comment')?.value;
    const mentions = comment ? this.extractMentions(comment) : [];

    this.store.dispatch(
      EventsActions.commentEvent({
        body: {
          ...this.bodyGroup.value,
          mentions
        } as CommentEventBody
      })
    );

    this.actions$
      .pipe(
        waitOnceForAction([EventsActions.commentEventSuccess]),
        tap(() => this.bodyGroup.reset()),
        tap(() => this.cdr.detectChanges()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    window.removeEventListener('kudos-toggled', this.boundKudosHandler as EventListener);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
