import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, TemplateRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { RANGES } from '../../../const/ranges';
import { AccessGroup } from '../../settings/settings.model';
import { ReportsSelectors } from '../reports.selectors';

@Component({
  templateUrl: './reports-core.component.html',
  styleUrls: ['./reports-core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsCoreComponent implements AfterViewInit {
  @HostBinding('class') hostClass = 'h-full';
  accessGroup = AccessGroup;

  @ViewChild('mileageTpl', { read: TemplateRef }) mileageTpl: TemplateRef<any> | null = null;
  @ViewChild('drivingTimeTpl', { read: TemplateRef }) drivingTimeTpl: TemplateRef<any> | null = null;
  @ViewChild('vehicleIssuesTpl', { read: TemplateRef }) vehicleIssuesTpl: TemplateRef<any> | null = null;
  @ViewChild('distanceDrivenTpl', { read: TemplateRef }) distanceDrivenTpl: TemplateRef<any> | null = null;
  @ViewChild('eventsTpl', { read: TemplateRef }) eventsTpl: TemplateRef<any> | null = null;
  @ViewChild('alarmsTpl', { read: TemplateRef }) alarmsTpl: TemplateRef<any> | null = null;
  @ViewChild('accidentsTpl', { read: TemplateRef }) accidentsTpl: TemplateRef<any> | null = null;
  @ViewChild('tripsTpl', { read: TemplateRef }) tripsTpl: TemplateRef<any> | null = null;
  @ViewChild('vehicleChecksTpl', { read: TemplateRef }) vehicleChecksTpl: TemplateRef<any> | null = null;
  @ViewChild('onlineStatusTpl', { read: TemplateRef }) onlineStatusTpl: TemplateRef<any> | null = null;
  @ViewChild('userLogsTpl', { read: TemplateRef }) userLogsTpl: TemplateRef<any> | null = null;

  hasMileage = false;
  hasDrivingTime = false;
  hasVehicleIssues = false;
  hasDistanceDriven = false;
  hasEvents = false;
  hasAccidents = false;
  hasTrips = false;
  hasVehicleChecks = false;
  hasOnlineStatus = false;

  mileageLoading$ = this.store.select(ReportsSelectors.mileageLoading);
  drivingTimeLoading$ = this.store.select(ReportsSelectors.drivingTimeLoading);
  vehicleIssuesLoading$ = this.store.select(ReportsSelectors.vehicleIssuesLoading);
  distanceDrivenLoading$ = this.store.select(ReportsSelectors.distanceDrivenLoading);
  eventsLoading$ = this.store.select(ReportsSelectors.eventsLoading);
  alarmsLoading$ = this.store.select(ReportsSelectors.alarmsLoading);
  accidentsLoading$ = this.store.select(ReportsSelectors.accidentsLoading);
  tripsLoading$ = this.store.select(ReportsSelectors.tripsLoading);
  vehicleChecksLoading$ = this.store.select(ReportsSelectors.vehicleChecksLoading);
  vehicleOnlineStatusLoading$ = this.store.select(ReportsSelectors.vehicleOnlineStatusLoading);
  userLogsLoading$ = this.store.select(ReportsSelectors.userLogsLoading);

  private readonly RANGES = RANGES;
  selectedRangeMessage$ = this.store.select(ReportsSelectors.rangeFilter).pipe(
    map(params => this.RANGES.find(range => range.getFrom() === params.from && range.getTo() === params.to)?.text ?? 'Custom')
  );

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly store: Store
  ) {}

  ngAfterViewInit(): void {
    this.hasMileage = !!this.mileageTpl;
    this.hasDrivingTime = !!this.drivingTimeTpl;
    this.hasVehicleIssues = !!this.vehicleIssuesTpl;
    this.hasDistanceDriven = !!this.distanceDrivenTpl;
    this.hasEvents = !!this.eventsTpl;
    this.hasAccidents = !!this.accidentsTpl;
    this.hasTrips = !!this.tripsTpl;
    this.hasVehicleChecks = !!this.vehicleChecksTpl;
    this.hasOnlineStatus = !!this.onlineStatusTpl;
    this.cdr.detectChanges();
  }
}
