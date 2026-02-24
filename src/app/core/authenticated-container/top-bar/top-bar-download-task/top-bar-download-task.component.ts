import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, interval, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { TopBarDownloadTaskDialogComponent } from 'src/app/core/authenticated-container/top-bar/top-bar-download-task/top-bar-download-task-dialog/top-bar-download-task-dialog.component';
import { TopBarDownloadTaskDialogData } from 'src/app/core/authenticated-container/top-bar/top-bar-download-task/top-bar-download-task-dialog/top-bar-download-task-dialog.model';
import { AppState } from 'src/app/store/app-store.model';
import { downloadTaskFetchFiles, downloadTaskFetchList, downloadTaskReset } from 'src/app/store/download-task/download-task.actions';
import { DownloadTaskListData } from 'src/app/store/download-task/download-task.model';

@Component({
  selector: 'app-top-bar-download-task',
  templateUrl: './top-bar-download-task.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarDownloadTaskComponent implements OnInit, OnDestroy {
  downloadTaskListData$ = this.store.select(state => state.downloadTask.listData);
  downloadTaskListLoading$ = this.store.select(state => state.downloadTask.listLoading);
  private readonly subscription = new Subscription();
  private readonly destroy$ = new Subject<void>();
  private readonly viewedTaskIds = new Set<number>();
  isFlashing = false;
  private isFirstLoad = true;
  private knownTaskIds = new Set<number>();

  constructor(private readonly store: Store<AppState>, private readonly dialog: Dialog, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchList();

    const downloadTasksSubscription = this.downloadTaskListData$
      .pipe(
        filter(tasks => !!tasks),
        tap(tasks => {
          if (this.isFirstLoad) {
            if (tasks && tasks.length > 0) {
              this.knownTaskIds = new Set(tasks.map(task => task.id));
              this.isFirstLoad = false;
            }
          } else {
            this.checkForNewTasks(tasks);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.subscription.add(downloadTasksSubscription);

    const intervalSubscription = interval(60000)
      .pipe(
        filter(() => !document.hidden),
        tap(() => this.fetchList()),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.subscription.add(intervalSubscription);
  }

  private checkForNewTasks(tasks: DownloadTaskListData[]): void {
    if (!tasks || tasks.length === 0) {
      return;
    }
    const newTasks = tasks.filter(task => !this.knownTaskIds.has(task.id));

    if (newTasks.length > 0) {
      this.triggerFlashingEffect();

      newTasks.forEach(task => this.knownTaskIds.add(task.id));
    }

    this.knownTaskIds = new Set([...this.knownTaskIds, ...tasks.map(task => task.id)]);
  }

  private triggerFlashingEffect(): void {
    if (this.isFlashing) return;

    let flashCount = 0;
    const maxFlashes = 3;
    const flashDuration = 500;

    const executeFlash = () => {
      this.isFlashing = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.isFlashing = false;
        this.cdr.detectChanges();

        flashCount++;

        if (flashCount < maxFlashes) {
          setTimeout(executeFlash, 250);
        }
      }, flashDuration);
    };

    executeFlash();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(downloadTaskReset());
  }

  handleDownloadTaskClick(downloadTask: DownloadTaskListData): void {
    this.store.dispatch(downloadTaskFetchFiles({ id: downloadTask.id }));
    this.dialog.open<void, TopBarDownloadTaskDialogData>(TopBarDownloadTaskDialogComponent, { data: { downloadTask }, autoFocus: 'dialog' });

    this.viewedTaskIds.add(downloadTask.id);
  }

  private fetchList(): void {
    this.store.dispatch(downloadTaskFetchList());
  }

  public getDisplayState(state: string): string {
    const stateMapping: Record<string, string> = {
      'Task finished': 'Clip ready to download',
      Waiting: 'Clip in progress...'
    };

    return stateMapping[state] || state;
  }

  formatDuration(seconds: number): string {
    if (!seconds || seconds === 0) {
      return '0s';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    if (remainingSeconds > 0 || parts.length === 0) {
      parts.push(`${remainingSeconds}s`);
    }

    return parts.join(' ');
  }
}
