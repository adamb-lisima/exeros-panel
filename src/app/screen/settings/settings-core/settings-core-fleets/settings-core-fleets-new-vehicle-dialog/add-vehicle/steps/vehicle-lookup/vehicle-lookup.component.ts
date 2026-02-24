import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, take } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Vehicle } from '../../../../../../../vehicles/vehicles.model';
import { SettingsActions } from '../../../../../../settings.actions';
import { SettingsSelectors } from '../../../../../../settings.selectors';

@Component({
  selector: 'app-vehicle-lookup',
  templateUrl: './vehicle-lookup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleLookupComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Output() dvlaDataReceived = new EventEmitter<any>();

  @Input() validationErrors: { [key: string]: string[] } | null = null;

  vehicleNotFound: boolean = false;
  isLoading: boolean = false;

  vehicleLookupLoading$: Observable<boolean>;
  vehicleLookupResult$: Observable<Vehicle | undefined>;

  private readonly destroy$ = new Subject<void>();

  lookupForm: FormGroup;

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {
    this.lookupForm = this.fb.group({
      regPlate: ['', [Validators.required]]
    });

    this.vehicleLookupLoading$ = this.store.select(SettingsSelectors.vehicleLookupLoading);
    this.vehicleLookupResult$ = this.store.select(SettingsSelectors.vehicleLookupResult);
  }

  ngOnInit(): void {
    this.vehicleLookupResult$.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.dvlaDataReceived.emit(result);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.store.dispatch(SettingsActions.resetVehicleLookup());
  }

  lookupVehicle(): void {
    if (this.lookupForm.valid) {
      const regPlate = this.lookupForm.get('regPlate')?.value;

      this.vehicleNotFound = false;
      this.isLoading = true;

      this.store.dispatch(SettingsActions.lookupVehicle({ regPlate }));

      setTimeout(() => {
        this.isLoading = false;

        this.vehicleLookupResult$.pipe(take(1), takeUntil(this.destroy$)).subscribe(result => {
          if (result) {
            this.dvlaDataReceived.emit(result);
          } else {
            this.vehicleNotFound = true;
          }
        });
      }, 4000);
    } else {
      this.lookupForm.markAllAsTouched();
    }
  }

  isFormValid(): boolean {
    return this.lookupForm.valid;
  }

  getRegPlateValue(): string {
    return this.lookupForm.get('regPlate')?.value ?? '';
  }
}
