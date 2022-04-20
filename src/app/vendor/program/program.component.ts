import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core'
import { ThemeConstantService } from '../../shared/services/theme-constant.service';
import { environment } from 'src/environments/environment';
import { map, take, takeUntil, tap } from 'rxjs/operators';
import { startOfToday, endOfToday, format, fromUnixTime, startOfDay } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import * as _ from 'lodash';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { IActivityLog, ColumnDefs, LiveProgramColumnDefs, LiveProgramColumnsDef } from 'src/app/logistics/classes';
import { LogisticsService } from 'src/app/logistics/services.service';
import { GeoJson, FeatureCollection } from 'src/app/logistics/map';
import { range, Subject } from 'rxjs';
import { LiveService } from 'src/app/shared/services/live.service';
import { ProgramService } from 'src/app/shared/services/program.service';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { database } from 'firebase';
import { CustomersModule } from 'src/app/customers/customers.module';

am4core.useTheme(am4themes_animated);

declare var mapboxgl: any;

export interface Data {
  id: number;
  name: string;
  age: number;
  address: string;
  disabled: boolean;
}

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.css']
})
export class ProgramComponent implements OnInit, OnDestroy {

  @ViewChild('map', { static: true }) mapElement: ElementRef;


  date = startOfToday();
  mode = 'month';
  // Grid
  rowFleetData: any[];
  columnFleetDefsProgram = LiveProgramColumnsDef;
  columnDefs =  LiveProgramColumnsDef;

  defaultColDef = {
    flex: 1,
    cellClass: 'align-right',
    enableCellChangeFlash: true,
    resizable: true,
  };



  panelChange(change: { date: Date; mode: string }): void {
    console.log(change.date, change.mode);
  }

  onValueChange(value: Date): void {
    console.log(`Current value: ${value}`);
    this.date = startOfDay(new Date(value));
    this.searchData();
  }

  getMonthData(date: Date): number | null {
    if (date.getMonth() === 8) {
      return 1394;
    }
    return null;
  }

  visible = false;

  lat = 37.75;
  lng = -122.41;
  loading = false;

  // mapData
  map: any = mapboxgl.Map;
  source: any;
  markers: any;

  columnFleetDefs = LiveProgramColumnDefs

  rowData: IActivityLog[];
  liveServiceData: any[] = [];
  stopSubscription$: Subject<boolean> = new Subject();
  activityList: IActivityLog[];
  startDate: Date;
  endDate: Date;

  private chart: am4charts.XYChart;
  chartData: any;
  gridApi: any;
  gridColumnApi: any;

  isSpinning: boolean = true;
  isAssignmentsModalVisible: boolean = false;

  constructor(
    private logisticsService: LogisticsService,
    private liveService: LiveService,
    private programService: ProgramService,
    private routesService: RoutesService,
    private zone: NgZone
  ) {
    this.markers = [] as GeoJson[];
    this.startDate = startOfToday();
    this.endDate = endOfToday();
  }

  ngOnInit() {
    this.markers = this.logisticsService.getMarkers(this.startDate, this.endDate);
    setTimeout(() => {
      this.searchData();
      this.isSpinning = false
    }, 500);
    //this.initializeMap();
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }


  pageIndex = 1;
  pageSize = 50;
  total = 1;
  listOfData: any[] = [];
  sortValue: string | null = null;
  sortKey: string | null = null;
  filterGender = [{ text: 'male', value: 'male' }, { text: 'female', value: 'female' }];
  searchGenderList: string[] = [];

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.searchData();
  }

  searchData(reset: boolean = false): void {
    if (reset) {
      this.pageIndex = 1;
    }
    this.loading = true;
    this.programService.getProgramsByDay(this.date).pipe(
      take(1),
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      })),
      tap(data => {
        this.loading = false;
        this.total = data.length;
        console.log(data);
        
        this.rowData = data;
        let listCustomer: any[] = [];
      })
    ).subscribe();
  }

  updateFilter(value: string[]): void {
    this.searchGenderList = value;
    this.searchData(true);
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }

  getAssignments() {
    console.log('date of assignments: ', this.date);
    this.isAssignmentsModalVisible = true;
  }

  deleteAssignment(assignmentId: string, customerId: string ) {
    this.routesService.deleteCustomerVendorAssignment(assignmentId, customerId);
  }

  cancelDeleteAssignment(): void {
    console.log('delete cancelled');
  }

  onPanelChange(event) {
}

  handleCancel() {
    this.isAssignmentsModalVisible = false;
  }

  handleOk() {
    this.isAssignmentsModalVisible = false;
  }

  initializeMap() {
  }

  formatDate(date: any) {
    return format(fromUnixTime(date.seconds), 'HH:mm', { locale: esLocale });
  }

  flyTo(data: GeoJson) {
    this.map.flyTo({
      center: data.geometry.coordinates
    })
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

}