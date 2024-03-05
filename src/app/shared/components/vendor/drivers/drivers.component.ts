import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DriversService } from 'src/app/shared/services/drivers.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { RolService } from 'src/app/shared/services/roles.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

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
  isEditPassword: boolean = false;
  responseUpdate: string = "";
  modalName: string = "Agregar PR";

  signupForm: UntypedFormGroup;
  signupFormEdit: UntypedFormGroup;
  signupFormPassword: UntypedFormGroup;
  infoLoad: any = [];
  userlevelAccess: string;
  user: any;

  constructor(
    private driversService: DriversService,
    private nzMessageService: NzMessageService,
    private rolService: RolService,
    public authService: AuthenticationService,
    private fb: UntypedFormBuilder
  ) {
    this.authService.user.subscribe((user) => {
      this.user = user;
      if (this.user.rolId != undefined) { // get rol assigned               
        this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
          this.infoLoad = item;
          this.userlevelAccess = this.infoLoad.optionAccessLavel;
        });
      }
    });

  }

  ngOnInit(): void {
    this.getSubscriptions();
    this.createForm();
  }
  sendMessage(type: string, message: string): void {
    this.nzMessageService.create(type, message);
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
      password: ['', Validators.compose([Validators.required])],
      verifyPassword1: ['', [this.confirmValidator]]
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

    this.signupFormPassword = this.fb.group({
      id: [],
      password: ['', Validators.compose([Validators.required])],
      verifyPasswordSec: ['', [this.confirmValidatorPass]]
    });
  }

  ngOnDestroy() {
    if (this.driversSubscription) {
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
    if (this.userlevelAccess == "1") {
      this.driversService.deleteDriver(data.uid);
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para borrar datos, favor de contactar al administrador.");
    }

  }

  cancelDelete() {
    console.log('do not delete driver');
  }

  editRecord(data) {
    this.isEditMode = true;
    this.isEditPassword = false;
    this.modalName = "Editar PR";
    this.patchForm(data);
  }

  editRecordPassword(data) {
    this.isEditMode = true;
    this.isEditPassword = true;
    this.modalName = "Restablecer Contraseña";
    this.patchFormPassword(data);
  }

  patchForm(data: any) {
    this.signupFormEdit.patchValue({ ...data });
    this.openCreateDriverModal();
  }
  patchFormPassword(data: any) {
    this.signupFormPassword.patchValue({ ...data });
    this.openCreateDriverModal();
  }

  createDriver() {
    const isValid: boolean = true;
    if (this.userlevelAccess != "3") {

      if (this.isEditMode && !this.isEditPassword) {
        //is edit contact
        if (this.signupFormEdit.valid) {
          let currSignForm = this.signupFormEdit.value;
          currSignForm.displayName = currSignForm.firstName + ' ' + currSignForm.lastName;
          this.driversService.updateDriver(currSignForm.id, currSignForm).then(() => {
            this.isVisibleNewDriver = false;
            this.isCreatingDriver = false;
            this.isEditMode = false;
            this.modalName = "Agregar PR";
          });
          this.nzMessageService.success("Se editó el contacto con éxito");
        } else {
          console.log('singnup Edit no es valido');
          Object.values(this.signupFormEdit.controls).forEach(control => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          });
        }
      } else {
        if (!this.isEditMode && !this.isEditPassword) {
          // is Adding
          if (this.signupForm.valid) {
            this.driversService.createDriver(this.signupForm.value).then((response) => {
              this.isVisibleNewDriver = false;
              this.isCreatingDriver = false;
              this.isEditMode = false;
            });
            this.nzMessageService.success("Se agregó con exito el PR");
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
          console.log(this.signupFormPassword.value);
          if (this.signupFormPassword.valid) {
            this.driversService.resetPassword(this.signupFormPassword.controls['id'].value, this.signupFormPassword.controls['password'].value).then((response) => {
              this.isEditPassword = false;
              this.isEditMode = false;
              this.isVisibleNewDriver = false;
            });
            this.nzMessageService.success('Se actualizó la contraseña con éxito');
          } else {
            console.log('singnup Contraseña no es valido');
            Object.values(this.signupFormPassword.controls).forEach(control => {
              if (control.invalid) {
                control.markAsDirty();
                control.updateValueAndValidity({ onlySelf: true });
              }
            });
          }
        }
      }
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
    }

  }

  createDriverModal() {
    this.isEditMode = false;
    this.isEditPassword = false;
    this.signupForm.pristine;
    this.modalName = "Agregar PR";
    this.openCreateDriverModal();
  }

  openCreateDriverModal() {
    this.isVisibleNewDriver = true;
  }

  closeNewDriverModal() {
    this.isVisibleNewDriver = false;
  }

  validateConfirmPassword(): void {
    setTimeout(() => this.isEditPassword ? this.signupFormPassword.controls.verifyPasswordSec.updateValueAndValidity() : this.signupForm.controls.verifyPassword1.updateValueAndValidity());
  }

  validateConfirmPassword1(): void {
    setTimeout(() => this.signupForm.controls.verifyPassword1.updateValueAndValidity());
  }

  confirmValidatorPass = (control: UntypedFormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value !== this.signupFormPassword.controls.password.value) {
      return { verifyPasswordSec: true, error: true };
    }
    return {};
  };
  confirmValidator = (control: UntypedFormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value !== this.signupForm.controls.password.value) {
      return { verifyPassword1: true, error: true };
    }
    return {};
  };

}
