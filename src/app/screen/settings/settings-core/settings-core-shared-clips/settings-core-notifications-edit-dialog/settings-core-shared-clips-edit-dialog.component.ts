import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, Subscription, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { waitOnceForAction } from 'src/app/util/operators';
import { SettingsActions } from '../../../settings.actions';
import { SharedClipsEmailsElement } from '../../../settings.model';

interface ContactForm {
  name: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  templateUrl: './settings-core-shared-clips-edit-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCoreSharedClipsEditDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private sub?: Subscription;
  title: string = '';

  bodyGroup: FormGroup<{
    access_type: FormControl<'LIMITED' | 'UNLIMITED'>;
    contacts: FormArray<FormGroup<ContactForm>>;
  }>;

  constructor(@Inject(DIALOG_DATA) public data: SharedClipsEmailsElement, private readonly dialogRef: DialogRef, private readonly fb: FormBuilder, private readonly cdr: ChangeDetectorRef, private readonly store: Store, private action$: Actions) {
    this.title = `Edit shared clips e-mails for company: ${data.company_name}`;

    this.bodyGroup = this.fb.group({
      access_type: this.fb.control<'LIMITED' | 'UNLIMITED'>('UNLIMITED', { nonNullable: true }),
      contacts: this.fb.array<FormGroup<ContactForm>>([])
    });
  }

  ngOnInit(): void {
    this.sub = new Subscription();

    if (this.data.access_type === 'LIMITED') {
      this.bodyGroup.controls.access_type.setValue('LIMITED');
    }
    if (this.data.contacts && this.data.contacts.length > 0) {
      this.data.contacts.forEach(contact => {
        this.addContactRow(contact.name, contact.email);
      });
    } else {
      this.addContactRow();
    }

    this.bodyGroup.controls.access_type.valueChanges
      .pipe(
        tap(accessType => {
          if (accessType === 'LIMITED') {
            if (this.contactsArray.length === 0) {
              this.addContactRow();
            }
          }
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get contactsArray(): FormArray<FormGroup<ContactForm>> {
    return this.bodyGroup.controls.contacts;
  }

  addContactRow(name: string = '', email: string = ''): void {
    const contactGroup = this.fb.group<ContactForm>({
      name: this.fb.control(name, { validators: [Validators.required], nonNullable: true }),
      email: this.fb.control(email, { validators: [Validators.required, Validators.email], nonNullable: true })
    });

    this.contactsArray.push(contactGroup);
    this.cdr.detectChanges();
  }

  removeRow(index: number): void {
    this.contactsArray.removeAt(index);
    this.cdr.detectChanges();
  }

  handleSaveClick(): void {
    const formValue = this.bodyGroup.getRawValue();

    const body = {
      company_id: this.data.company_id,
      access_type: formValue.access_type,
      contacts: formValue.contacts
    };

    this.store.dispatch(
      SettingsActions.updateSharedClips({
        body
      })
    );

    this.action$
      .pipe(
        waitOnceForAction([SettingsActions.updateSharedClipsSuccess]),
        tap(() => {
          this.store.dispatch(
            SettingsActions.fetchSharedClips({
              company_id: this.data.company_id
            })
          );
        }),
        tap(() => this.dialogRef.close()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
