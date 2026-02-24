import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonObjectsActions } from '../../../../store/common-objects/common-objects.actions';
import { FleetsTreeElement } from '../../../../store/common-objects/common-objects.model';
import { CommonObjectsSelectors } from '../../../../store/common-objects/common-objects.selectors';
import { waitOnceForAction } from '../../../../util/operators';
import { DriversActions } from '../../drivers.actions';
import { CreateMessageBody, DriversElement } from '../../drivers.model';
import { DriversSelectors } from '../../drivers.selectors';

const MESSAGE_TYPE_DRIVER = 'DRIVER';
const MESSAGE_TYPE_FLEET = 'FLEET';

@Component({
  templateUrl: './drivers-left-message-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversLeftMessageDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  currentDriverData: string = '{}';
  fleetTreeData: string = '[]';
  driversData: string = '[]';
  dialogVisible: string = 'true';
  searchControl = this.fb.control('');
  initialMessageType: string = MESSAGE_TYPE_DRIVER;
  private readonly currentFleetId: number = 1;

  bodyGroup = this.fb.group({
    message_type: MESSAGE_TYPE_DRIVER,
    receiver_id: this.data?.driver?.id,
    message: ''
  });

  fleetOptions$ = this.store.select(CommonObjectsSelectors.fleetsTree).pipe(map(fleetsTree => this.flattenFleetTree(fleetsTree)));

  drivers$ = this.store.select(DriversSelectors.dialogDrivers);

  @ViewChild('driverMessageDialog') driverMessageDialogRef!: ElementRef;

  private readonly messageSentHandler: any;
  private readonly dialogClosedHandler: any;
  private readonly fleetChangedHandler: any;
  private readonly driverSearchChangedHandler: any;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store, private readonly actions$: Actions, private readonly fb: FormBuilder, private readonly dialogRef: DialogRef, private readonly cdr: ChangeDetectorRef, @Inject(DIALOG_DATA) public data: { driver?: DriversElement; fleetId?: number }) {
    this.messageSentHandler = this.handleMessageSent.bind(this);
    this.dialogClosedHandler = this.handleCloseClick.bind(this);
    this.fleetChangedHandler = this.handleFleetChanged.bind(this);
    this.driverSearchChangedHandler = this.handleDriverSearchChanged.bind(this);
    this.currentFleetId = this.data?.fleetId ?? 1;

    if (this.data?.driver) {
      this.currentDriverData = JSON.stringify(this.data.driver);
      this.initialMessageType = MESSAGE_TYPE_DRIVER;
      this.bodyGroup.patchValue({
        message_type: MESSAGE_TYPE_DRIVER,
        receiver_id: this.data.driver.id
      });
    } else {
      this.currentDriverData = '{}';
      this.initialMessageType = MESSAGE_TYPE_DRIVER;
      this.bodyGroup.patchValue({
        message_type: MESSAGE_TYPE_DRIVER,
        receiver_id: null
      });
    }

    this.store.dispatch(CommonObjectsActions.fetchFleetsTree());

    this.store.dispatch(
      DriversActions.fetchDialogDrivers({
        params: { fleet_id: this.currentFleetId }
      })
    );
  }

  private flattenFleetTree(fleets: FleetsTreeElement[], parentId?: number, level = 0): any[] {
    let result: any[] = [];

    for (const fleet of fleets) {
      result.push({
        value: fleet.id,
        label: '\u00A0\u00A0'.repeat(level) + fleet.name,
        parentId,
        level
      });

      if (fleet.children && fleet.children.length > 0) {
        result = result.concat(this.flattenFleetTree(fleet.children, fleet.id, level + 1));
      }
    }

    return result;
  }

  ngOnInit() {
    window.addEventListener('message-sent', this.messageSentHandler);
    window.addEventListener('dialog-closed', this.dialogClosedHandler);
    window.addEventListener('fleet-changed', this.fleetChangedHandler);
    window.addEventListener('driver-search-changed', this.driverSearchChangedHandler);

    this.loadVueWidgetScript();

    this.fleetOptions$.pipe(takeUntil(this.destroy$)).subscribe(options => {
      this.fleetTreeData = JSON.stringify(options);
      this.cdr.detectChanges();
    });

    this.drivers$.pipe(takeUntil(this.destroy$)).subscribe(drivers => {
      this.driversData = JSON.stringify(drivers);

      if (drivers.length === 0 && this.data?.driver) {
        this.data.driver = undefined;
        this.currentDriverData = '{}';

        this.bodyGroup.patchValue({
          receiver_id: null
        });

        if (this.bodyGroup.get('message_type')?.value === MESSAGE_TYPE_DRIVER) {
          this.bodyGroup.patchValue({
            message_type: MESSAGE_TYPE_FLEET
          });
        }
      }

      this.cdr.detectChanges();

      if (this.data?.driver && this.driverMessageDialogRef && drivers.length > 0) {
        const dialogElement = this.driverMessageDialogRef.nativeElement;
        if (dialogElement && typeof dialogElement.openWithDriver === 'function') {
          dialogElement.openWithDriver(this.data.driver);
        }
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initDialogComponent();
    }, 0);
  }

  private loadVueWidgetScript() {
    if (!customElements.get('driver-message-dialog')) {
      const script = document.createElement('script');
      script.src = 'assets/vue-widget.js';
      script.type = 'module';

      script.onload = () => {
        this.cdr.detectChanges();

        setTimeout(() => {
          this.initDialogComponent();
        }, 100);
      };

      document.head.appendChild(script);
    }
  }

  private initDialogComponent() {
    if (!this.driverMessageDialogRef) {
      return;
    }

    const dialogElement = this.driverMessageDialogRef.nativeElement;

    if (dialogElement) {
      dialogElement.setAttribute('initial-fleet-id', String(this.currentFleetId));

      const canOpenWithDriver = typeof dialogElement.openWithDriver === 'function';

      if (this.data?.driver && canOpenWithDriver) {
        dialogElement.openWithDriver(this.data.driver);
      } else if (canOpenWithDriver) {
        dialogElement.openWithDriver(null);
      }
    }
  }

  handleCloseClick(): void {
    this.dialogRef.close();
  }

  handleFleetChanged(event: CustomEvent): void {
    if (event.detail === undefined || event.detail === null) return;

    const fleetId = Number(event.detail);

    if (this.data?.driver) {
      this.data.driver = undefined;
      this.currentDriverData = '{}';
    }

    if (this.driverMessageDialogRef) {
      const dialogElement = this.driverMessageDialogRef.nativeElement;
      if (dialogElement && typeof dialogElement.resetDriverSelection === 'function') {
        dialogElement.resetDriverSelection();
      }
    }

    this.store.dispatch(
      DriversActions.fetchDialogDrivers({
        params: {
          fleet_id: fleetId
        }
      })
    );

    this.cdr.detectChanges();
  }

  handleDriverSearchChanged(event: CustomEvent): void {
    if (event.detail === undefined) return;

    let searchText = '';
    let fleetId = this.currentFleetId;

    if (typeof event.detail === 'object' && event.detail !== null) {
      searchText = event.detail.search ?? '';
      if (event.detail.fleetId !== undefined && event.detail.fleetId !== null) {
        const parsedId = Number(event.detail.fleetId);
        if (!isNaN(parsedId)) {
          fleetId = parsedId;
        }
      }
    } else if (typeof event.detail === 'string') {
      searchText = event.detail;
    }

    this.searchControl.setValue(searchText, { emitEvent: false });

    this.store.dispatch(
      DriversActions.fetchDialogDrivers({
        params: {
          search: searchText,
          fleet_id: fleetId
        }
      })
    );
  }

  handleMessageSent(event: CustomEvent): void {
    if (!event.detail) return;

    try {
      const messageData = JSON.parse(event.detail);

      this.bodyGroup.patchValue({
        message_type: messageData.message_type,
        receiver_id: Number(messageData.receiver_id),
        message: messageData.message
      });

      this.bodyGroup.markAsDirty();

      if (this.bodyGroup.dirty) {
        const messageBody: CreateMessageBody = {
          message_type: String(this.bodyGroup.get('message_type')?.value ?? ''),
          receiver_id: Number(this.bodyGroup.get('receiver_id')?.value ?? 0),
          message: String(this.bodyGroup.get('message')?.value ?? '')
        };

        this.store.dispatch(
          DriversActions.createMessage({
            body: messageBody
          })
        );

        this.actions$
          .pipe(
            waitOnceForAction([DriversActions.createMessageSuccess]),
            takeUntil(this.destroy$),
            tap(() => {
              this.dialogRef.close();
            })
          )
          .subscribe();
      }
    } catch (e) {
      console.error('Error processing message data:', e);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message-sent', this.messageSentHandler);
    window.removeEventListener('dialog-closed', this.dialogClosedHandler);
    window.removeEventListener('fleet-changed', this.fleetChangedHandler);
    window.removeEventListener('driver-search-changed', this.driverSearchChangedHandler);

    this.destroy$.next();
    this.destroy$.complete();
  }
}
