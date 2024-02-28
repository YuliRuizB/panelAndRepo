import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzTabComponent } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { IVendor } from 'src/app/shared/interfaces/vendor.type';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { DriversService } from 'src/app/shared/services/drivers.service';
import { RolService } from 'src/app/shared/services/roles.service';
import { VendorService } from 'src/app/shared/services/vendor.service';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-evidence',
  templateUrl: './evidence.component.html',
  styleUrls: ['./evidence.component.css']
})
export class EvidenceComponent implements OnInit {
  evidenceInfo;
  evidenceInfoDriver;
  loadingevidenceInfo =false;
  loadingevidenceInfoDriver = false;
  stopSubscription$: Subject<any> = new Subject();
  dateFilterForm: FormGroup;
  dateFilterFormDriver: FormGroup;
  userlevelAccess: string;
  infoLoad: any = [];
  driversList:any;
  user: any;
  vendorsList: any = [];
  
  constructor(private driverService: DriversService,
    private vendorsService: VendorService,
    private datePipe: DatePipe,
    public authService: AuthenticationService,
    private rolService: RolService,
    private fb: FormBuilder) {

      this.authService.user.subscribe((user) => {
        this.user = user;  
            
        if (this.user.rolId != undefined) { // get rol assigned  
               
          this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
            this.infoLoad = item;
            this.userlevelAccess = this.infoLoad.optionAccessLavel;
          });
        }
      });

      this.dateFilterForm = this.fb.group({
        selectedDate: [null], // 'selectedDate' is the name of the form control
      });

      this.dateFilterFormDriver = this.fb.group({
        selectedDate: [null], // 'selectedDate' is the name of the form control
        driverId:[],
        driver:[],
        vendorName:[],
        vendorId: [],
      });

      this.vendorsService.getVendors().pipe(
        takeUntil(this.stopSubscription$),
        map(actions => actions.map(a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data() as IVendor;
          return { id, ...data }
        })))
        .subscribe((vendors: IVendor[]) => {
          this.vendorsList = vendors;
         // console.log(this.vendorsList);
        });
  }
  onDateChangeDriver() {
  
    this.evidenceInfoDriver =[];
    this.driversList = [];
  }
  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }

  onVendorSelected(event, field) {
    if (event) {
      this.evidenceInfoDriver =[];
      this.driversList = [];
      const recordArray = _.filter(this.vendorsList, s => {
        return s.id == event;
      });
      const record = recordArray[0];
      
     this.fillDataDriver(record.id); 
      //this.programForm.controls[field].setValue(record.name);
    }
  }

  fillDataDriver(vendorId: string) {
    this.driverService.getDrivers(vendorId).pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id: id, ...data }
      }))
    ).subscribe((drivers) => {
      console.log(drivers);
      this.driversList = drivers;
    });
  }

  ngOnInit() {
    
  }

  onDriverSelected(event, field) {
   
    this.evidenceInfoDriver =[];
    if (event) {
      const selectedDateString = this.dateFilterFormDriver.get('selectedDate').value;

      const formattedDate = this.datePipe.transform(selectedDateString, 'dd-MM-yyyy');

      console.log(formattedDate);
   
      const recordArray = _.filter(this.driversList, s => {
        return s.id == event;
      });
      const record = recordArray[0];
      console.log("DriveSelected");
   
    console.log(formattedDate + " == " + record.id );
      this.driverService.getEvidenceDriversperDriver(formattedDate.toString(),record.id).pipe(
        map(actions => actions.map(a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data() as any;
          return { id: id, ...data }
        }))
      ).subscribe(evidence2 => {
     
          this.evidenceInfoDriver = evidence2;      
        console.log( this.evidenceInfoDriver);
          this.loadingevidenceInfoDriver = false;
        }, err => {
          this.loadingevidenceInfoDriver = false;
        });    
    }
  }
   
 
  onDateChange() {
   
    const selectedDate = new Date(this.dateFilterForm.get('selectedDate').value);
   
    this.loadingevidenceInfo = true;
  
    this.driverService.getEvidenceDrivers(selectedDate).pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id: id, ...data }
      }))
    ).subscribe(evidenceI => {
   
        this.evidenceInfo = evidenceI;      
      
        this.loadingevidenceInfo = false;
      }, err => {
        this.loadingevidenceInfo = false;
      });
  }
}
