import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DriversService } from 'src/app/shared/services/drivers.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  isEditContrasena: boolean = false;
  responseUpdate:string = "";
  modalName: string = "Agregar conductor";

  signupForm: FormGroup;
  signupFormEdit: FormGroup;
  signupFormContrasena: FormGroup;

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
      password: ['',Validators.compose([Validators.required])],
      verifyPassword1: ['', [this.confirmValidator] ]
    });

    this.signupFormEdit = this.fb.group({
      id: [],
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(5)])],
      lastName: ['', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(5)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      employeeId: ['', Validators.compose([Validators.minLength(7), Validators.maxLength(7), Validators.required])],
      vendorId: [this.vendorId, Validators.compose([Validators.required])],
      vendorName: [''],
      displayName: ['']
    });

    this.signupFormContrasena = this.fb.group({
      id: [],
      password: ['',Validators.compose([Validators.required])],
      verifyPasswordContra: ['', [this.confirmValidatorContra]]
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
  this.isEditMode = true;
  this.isEditContrasena = false;
  this.modalName = "Editar Conductor";
  this.patchForm(data);
  }

  editRecordContrasena(data){
    this.isEditMode = true;
    this.isEditContrasena = true;
    this.modalName = "Restablecer Contraseña";
    this.patchFormContrasena(data);
  }

  patchForm(data: any) {
    this.signupFormEdit.patchValue({ ...data });
    this.openCreateDriverModal();
  }
  patchFormContrasena(data: any) {
    this.signupFormContrasena.patchValue({ ...data });
    this.openCreateDriverModal();
  }

  createDriver() {
    const isValid: boolean =  true;
     if (this.isEditMode && !this.isEditContrasena) {
       //is edit contact
       if (this.signupFormEdit.valid) {
        let currSignForm = this.signupFormEdit.value;
        currSignForm.displayName = currSignForm.firstName + ' ' + currSignForm.lastName;
          this.driversService.updateDriver(currSignForm.id, currSignForm).then( () => {
          this.isVisibleNewDriver = false;
          this.isCreatingDriver = false;
          this.isEditMode = false;
          this.modalName ="Agregar conductor";
        });
        this.nzMessageService.success("Se editó el contacto con éxito");
      }else {
        console.log('singnup Edit no es valido');
        Object.values(this.signupFormEdit.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
      }
     } else {
       if (!this.isEditMode && !this.isEditContrasena) {
         // is Adding
          if (this.signupForm.valid) {
          this.driversService.createDriver(this.signupForm.value).then((response) => {
            this.isVisibleNewDriver = false;
            this.isCreatingDriver = false;
            this.isEditMode = false;
          }); 
          this.nzMessageService.success("Se agregó con exito el conductor");
          } else {
            console.log('singnup  no es valido');
            Object.values(this.signupForm.controls).forEach(control => {
              if (control.invalid) {
                control.markAsDirty();
                control.updateValueAndValidity({ onlySelf: true });
              }
            });
          }
       } else {
         // is update contraseña
         console.log(this.signupFormContrasena.value);
         if (this.signupFormContrasena.valid) {
         this.driversService.resetPassword(this.signupFormContrasena.controls['id'].value , this.signupFormContrasena.controls['password'].value).then((response) => {
          this.isEditContrasena = false;
          this.isEditMode = false;
          this.isVisibleNewDriver = false;
        });
        this.nzMessageService.success('Se actualizó la contraseña con éxito'); 
        } else {
          console.log('singnup Contraseña no es valido');
          Object.values(this.signupFormContrasena.controls).forEach(control => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          });
        }
       }
     }
  }

  createDriverModal() {
    this.isEditMode = false;
    this.isEditContrasena = false;
    this.signupForm.pristine;
    this.modalName ="Agregar conductor";
    this.openCreateDriverModal();
  }

  openCreateDriverModal() {
    this.isVisibleNewDriver = true;
  }

  closeNewDriverModal() {
    this.isVisibleNewDriver = false;
  }

  validateConfirmPassword(): void {
    setTimeout(() => this.isEditContrasena? this.signupFormContrasena.controls.verifyPasswordContra.updateValueAndValidity() : this.signupForm.controls.verifyPassword1.updateValueAndValidity());
  }

  validateConfirmPassword1(): void {
    setTimeout(() => this.signupForm.controls.verifyPassword1.updateValueAndValidity());
  }
 
  confirmValidatorContra = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value !== this.signupFormContrasena.controls.password.value) {
      return { verifyPasswordContra: true, error: true };
    }
    return {};
  };
   confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value  !== this.signupForm.controls.password.value) {
      return { verifyPassword1: true, error: true };
    }
    return {};
  };

}
