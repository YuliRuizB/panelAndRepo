import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DriversService } from 'src/app/shared/services/drivers.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-shared-vendor-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.css']
})
export class SharedVendorDriversComponent implements OnInit, OnDestroy {

  @Input() vendorId: string = '';
  driversList: any;
  driversSubscription: Subscription;
  
  view: string = 'cardView';
  isVisibleNewDriver: boolean = false;
  isCreatingDriver: boolean = false;
  isEditMode: boolean = false;

  signupForm: FormGroup;

  constructor(
    private driversService: DriversService,
    private nzMessageService: NzMessageService,
    private fb: FormBuilder
    ) { }

  ngOnInit(): void {
    this.getSubscriptions();
    this.createForm();
  }

  createForm() {
    this.signupForm = this.fb.group({
      id: [],
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(5)])],
      lastName: ['', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(5)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      employeeId: ['', Validators.compose([Validators.minLength(7), Validators.maxLength(7), Validators.required])],
      vendorId: [this.vendorId, Validators.compose([Validators.required])],
      vendorName: [''],
      displayName: [''],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      verifyPassword: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    });
  }

  ngOnDestroy() {
    if(this.driversSubscription) {
      this.driversSubscription.unsubscribe();
    }
  }

  getSubscriptions() {
    this.driversService.getDrivers(this.vendorId).pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id: id, ...data }
      }))
    ).subscribe((drivers) => {
      console.log(drivers);
      this.driversList = drivers;
    })
  }

  toggleActive(data) {
    this.driversService.toggleActiveDriver(data.uid, data.active)
  }

  deletePermission(data) {
    this.driversService.deleteDriver(data.uid)
  }

  cancelDelete() {
    console.log('do not delete driver');
  }

  editRecord(data) {
   this.patchForm(data);
  }

  patchForm(data: any) {
    this.signupForm.patchValue({ ...data });
    this.isEditMode = true;
    this.openCreateDriverModal();
  }

  createDriver() {
    if(this.signupForm.valid) {
      console.log(this.signupForm.value);
      if(this.isEditMode) {
        let CurrSingFrom = this.signupForm.value;
        CurrSingFrom.displayName = CurrSingFrom.firstName + ' ' + CurrSingFrom.lastName;
       this.driversService.updateDriver(CurrSingFrom.id, CurrSingFrom).then( () => {
          this.isVisibleNewDriver = false;
          this.isCreatingDriver = false;
          this.isEditMode = false;
        });
      } else {
        this.driversService.createDriver(this.signupForm.value).then((response) => {
          this.isVisibleNewDriver = false;
          this.isCreatingDriver = false;
          this.isEditMode = false;
        });
      }
      
    } else {
      console.log('la forma no es válida');
      
    }
    
  }

  createDriverModal() {
    this.isEditMode = false;
    this.signupForm.reset();
    this.openCreateDriverModal();
  }

  openCreateDriverModal() {
    this.isVisibleNewDriver = true;
  }

  closeNewDriverModal() {
    this.isVisibleNewDriver = false;
  }

}
