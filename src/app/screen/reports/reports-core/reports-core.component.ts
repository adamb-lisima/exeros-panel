import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, TemplateRef, ViewChild } from '@angular/core';
import { AccessGroup } from '../../settings/settings.model';

@Component({
  templateUrl: './reports-core.component.html',
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

  constructor(private readonly cdr: ChangeDetectorRef) {}

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
