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
import { IActivityLog, ColumnDefs ,LiveProgramColumnDefs, LiveProgramColumnsDef, LiveAsignacionesColumnDef } from 'src/app/logistics/classes';
import { LogisticsService } from 'src/app/logistics/services.service';
import { GeoJson, FeatureCollection } from 'src/app/logistics/map';
import { range, Subject, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { LiveService } from 'src/app/shared/services/live.service';
import { ProgramService } from 'src/app/shared/services/program.service';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { database } from 'firebase';
import { CustomersModule } from 'src/app/customers/customers.module';
import { UsersService } from 'src/app/shared/services/users.service';
import { ColDef, GridReadyEvent, ICellEditorParams } from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import { AssignmentsService } from 'src/app/shared/services/assignments.service';
import { DriversService } from 'src/app/shared/services/drivers.service';
import { VehiclesService } from 'src/app/shared/services/vehicles.service';
import { variable } from '@angular/compiler/src/output/output_ast';
import { ColourCellRenderer } from 'src/app/shared/components/routes/programs/colour-cell-renderer.component';




am4core.useTheme(am4themes_animated);

declare var mapboxgl: any;

export interface Data {
  id: number;
  name: string;
  age: number;
  address: string;
  disabled: boolean;
}
interface IActivityLogAssing {
  assigmentid?: string;
  program?:string;
  customerId?:string;
  customerName:string;
  routeId?:string;
  routeName?:string;
  vendorId?:string;
  vehicleId?:string;
  vehicleName?:string;
  beginhour?:string;
  stopBeginHour?:string;
  stopEndName?:string;
  type?:string;
  vendorName?:string;
  vendorid?:string;
  driverId?:string;
  driverName?:string;
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
  //columnFleetDefsAsingaciones = LiveAssignmentListDef;


  defaultColDef:  ColDef  = {
   // flex: 1,
    cellClass: 'align-right',
    resizable: true,
  };
  public rowSelection = 'multiple';

  visible = false;

  lat = 37.75;
  lng = -122.41;
  loading = false;

  // mapData
  map: any = mapboxgl.Map;
  source: any;
  markers: any;
  columnDefs = ColumnDefs;
  columnFleetDefs = LiveProgramColumnDefs

  rowData: IActivityLog[];
  rowDataAsignacionesPostProgramar: IActivityLog[];
  rowDataAsignacionesModal:IActivityLogAssing[];
  liveServiceData: any[] = [];
  stopSubscription$: Subject<boolean> = new Subject();
  startDate: Date;
  endDate: Date;

  private chart: am4charts.XYChart;
  chartData: any;
  gridApi: any;
  gripApi2: any;
  gridColumnApi: any;
  gridColumnApi2: any;

  isSpinning: boolean = true;
  isAssignmentsModalVisible: boolean = false;
  user: any;
  stopSubscriptions$:Subject<boolean> = new Subject();
  vendorRoutesSubscription: Subscription;
  customersList: any[] = [];
  assignmentList: any = [];
  assignmentSubscription: Subscription;
  vehicleAssignmentsList: any[] = [];
  vehicleAssignmentSubscription: Subscription;
  public arrDrivers: any[] =[];
  colors   = ['Red', 'Green', 'Blue'];
  
  vehiclesList: any[];
  vehiclesSubscription: Subscription;

  driversList: any[] = [];
  driversSubscription: Subscription;
  pageIndex = 1;
  pageSize = 50;
  total = 1;
  listOfData: any[] = [];
  sortValue: string | null = null;
  sortKey: string | null = null;
  filterGender = [{ text: 'male', value: 'male' }, { text: 'female', value: 'female' }];
  searchGenderList: string[] = [];

  constructor(
    private logisticsService: LogisticsService,
    private liveService: LiveService,
    private programService: ProgramService,
    private routesService: RoutesService,
    private authService: AuthenticationService,
    private usersService: UsersService,
    private assignmentsService: AssignmentsService,
    private vehiclesService: VehiclesService,
    private driversService: DriversService,
    private zone: NgZone
  ) {
    this.markers = [] as GeoJson[];
    this.startDate = startOfToday();
    this.endDate = endOfToday();
  }

  onQuickFilterChanged() {
    this.gridApi.setQuickFilter(
      (document.getElementById('quickFilter') as HTMLInputElement).value
    );
  }
  panelChange(change: { date: Date; mode: string }): void {
    //console.log(change.date, change.mode);
  }

  onValueChange(value: Date): void {
   // console.log(`Current value: ${value}`);
    this.date = startOfDay(new Date(value));
    this.searchData();
  }

  public columnFleetDefsAsingaciones: (ColDef) [] =[
    { headerName: 'Cliente', field: 'customerName',
      filter: true,checkboxSelection: true, headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true , sortable: true,enableCellChangeFlash:true },
    { headerName: 'Ruta', field: 'routeName', sortable: true, enableCellChangeFlash:true },
    { headerName: 'Programa / Turno', field: 'round', valueGetter: (params) => {
        if(params && params.node) {     
          return  params.node.data.round + " / " + params.node.data.program
        }
    }},{ headerName: 'Vehículo', field: 'vehicleName', cellRenderer: 'agGroupCellRenderer',
    cellEditor: 'agRichSelectCellEditor', cellEditorParams: {  //cellEditorPopup: true,
      values: this.colors,
      cellRenderer: ColourCellRenderer,
    }, sortable: true, enableCellChangeFlash:true },
    { headerName: 'Inicia', field: 'stopBeginHour', sortable: true, filter: true },
    { headerName: 'Conductor', field: 'driverName', sortable: true, editable: true,
     enableCellChangeFlash:true },
    { headerName: 'Tipo', field: 'type', sortable: true, enableCellChangeFlash:true },
    { headerName: 'Proveedor', field: 'vendorName', filter: true, sortable: true, enableCellChangeFlash:true }
     ];
     
    
    onSelectDrivers(vendorID:string) {
  // Llena drivers dropdonws
    this.vehiclesSubscription = this.vehiclesService.getVendorVehicles(vendorID).pipe(
      takeUntil(this.stopSubscription$),
      map(actions => actions.map((a:any) => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data}
      }))
    ).subscribe( vehicles => {
      //this.vehicleNames.push(...vehicles);
      this.arrDrivers.push(...vehicles);
    //  console.log("vehicles" + vehicles);
      //this.loading = false;
    });
  }


  getMonthData(date: Date): number | null {
    if (date.getMonth() === 8) {
      return 1394;
    }
    return null;
  }

  ngOnInit() {
    this.markers = this.logisticsService.getMarkers(this.startDate, this.endDate);
    setTimeout(() => {
      this.searchData();
      this.isSpinning = false
    }, 500);  
  }
  public columnAsignacion: ColDef = {
    //flex: 1,
    resizable: true,
  };

  getSubscriptions(vendorId: string) {
    this.vendorRoutesSubscription = this.usersService.getBoardingPassesByRoute(vendorId).pipe(
      takeUntil(this.stopSubscriptions$)
    ).subscribe(data => {
    // console.log("Datos=====" + data); // se  valida por cada customerid , rutaid

    var filterCustomer = [];
    var filterCustomerRoute = [];
    for (var x=0; x < data.length;x++) {
      for (var i = 0;i < data[x].passes.length; i++ ){
        if (data[x].passes[i].customer_id != undefined) {
        if (filterCustomer.indexOf(data[x].passes[i].customer_id) === -1 ) {
          filterCustomer.push(data[x].passes[i].customer_id);
          filterCustomerRoute.push({customer: data[x].customerId ,customerName: data[x].customerName, routeId: data[x].passes[i].routeId , routeName:data[x].passes[i].routeName});
        }
      }
      }
    }
      
    filterCustomerRoute.forEach((routeElem) => {  // element = cusomerID 
       // obtener informacion de vendorId y ruta 
       if(vendorId.length > 0 && routeElem.routeId.length > 0) {
       this.assignmentSubscription = this.assignmentsService.getActiveAssignmentsRoute(vendorId, routeElem.routeId).pipe(
        takeUntil(this.stopSubscription$),
        map(actions => actions.map(a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data() as any;
          return { id, ...data }
        }))
      ).subscribe( assignments => {

        assignments.forEach((element) => {
          // se valida por cada assigment , route 
          if (element.id.length > 0) {
          this.vehicleAssignmentSubscription = this.routesService.getRouteVehicleAssignments(routeElem.customer, 
            routeElem.routeId, element.id, vendorId).pipe(
            takeUntil(this.stopSubscription$),
            map(actions => actions.map(a => {
              const id = a.payload.doc.id;
              const data = a.payload.doc.data() as any;
              return { id, ...data}
            }))
          ).subscribe( assignmentsVehiculo => {
            //this.vehicleAssignmentsList.push(...assignmentsVehiculo);
            assignmentsVehiculo.forEach((vehiculoAssigmentElement) => { 
              if (element.active && vehiculoAssigmentElement.active){ // solo mostrara elentos activos

                this.assignmentList.push({
                  assigmentid: vehiculoAssigmentElement.assignmentId,
                  program: element.program,
                  customerId: routeElem.customerId,
                  customerName: routeElem.customerName,  //1
                  routeId: element.routeId,
                  routeName: routeElem.routeName,  //2
                  vendorId: element.vendorId,
                  round: element.round,  //3 Turno
                  vehicleId: vehiculoAssigmentElement.vehicleId,
                  vehicleName: vehiculoAssigmentElement.vehicleName, // 4
                  beginhour: element.beginhour,  //5
                  stopBeginHour: element. stopBeginHour,
                  stopEndName: element.stopEndName,
                  type: element.type,  // 6
                  vendorName: element.vendorName, //7
                  vendorid: vendorId,
                  driverId: vehiculoAssigmentElement.driverId,
                  driverName: vehiculoAssigmentElement.driverName //8
                });
              }
            });
          });
          }
         
        });
      });
    }
    });
    })
    //console.log("assignmentList" + this.assignmentList);
    this.rowDataAsignacionesModal=[];
    if(this.assignmentList != undefined){
    this.rowDataAsignacionesModal.push(...this.assignmentList);
    }
  

    this.driversSubscription = this.driversService.getDrivers(vendorId).pipe(
      takeUntil(this.stopSubscription$),
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data}
      }))
    ).subscribe( drivers => {
      this.driversList = drivers;
      //console.log("drivers" + drivers);
     // this.loading = false;
    });
  
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

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
        //console.log(data);
        
        this.rowData = data;
        let listCustomer: any[] = [];
        this.authService.user.subscribe( (user:any) => {
          this.user = user;
          this.getSubscriptions(user.vendorId);

          this.onSelectDrivers(user.vendorId);
          
       console.log('arrDrivers on select'+ this.arrDrivers);
        })

      })
    ).subscribe();
  }

  updateFilter(value: string[]): void {
    this.searchGenderList = value;
    this.searchData(true);
  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
    // Modal 
    this.stopSubscriptions$.next();
    this.stopSubscriptions$.complete();
  }

  getAssignments() {
    console.log('date of assignments: ', this.date);
    this.isAssignmentsModalVisible = true;
    console.log("rowDataAsignacionesModal" + this.rowDataAsignacionesModal);
  }

  deleteAssignment(assignmentId: string, customerId: string ) {
    this.routesService.deleteCustomerVendorAssignment(assignmentId, customerId);
  }

  cancelDeleteAssignment(): void {
    console.log('delete cancelled');
  }

  handleCancel() {
    this.isAssignmentsModalVisible = false;
    //this.listOfParentData = [];
    this.customersList = [];
  }

  handleOk() {
    this.isAssignmentsModalVisible = false;
  }

  formatDate(date: any) {
    return format(fromUnixTime(date.seconds), 'HH:mm', { locale: esLocale });
  }

  flyTo(data: GeoJson) {
    this.map.flyTo({
      center: data.geometry.coordinates
    })
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onGridReady1(params: GridReadyEvent) {
    this.gripApi2 = params.api;
    this.gridColumnApi2 = params.columnApi;
  }

  // clasess
  
  cellEditorSelector(params: ICellEditorParams) {
    if (params.node.data.vehicleName != undefined) {
      
      this.onSelectDrivers(params.node.data.vendorId);
       console.log('arrDrivers'+ this.arrDrivers);
        return {
        component: 'agRichSelectCellEditor',
        params: {
          values: ['ejem'], //arrDrivers,
        },
        popup: true,
      };
    }
    return undefined;
  }
}

