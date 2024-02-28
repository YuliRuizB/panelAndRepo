import { Component, OnInit, OnDestroy } from '@angular/core';
import { DevicesService } from 'src/app/shared/services/devices.service';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IVehicle, columnDefs } from 'src/app/shared/interfaces/vehicle.type';
import * as _ from 'lodash';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { RolService } from 'src/app/shared/services/roles.service';

@Component({
  selector: 'app-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.css']
})
export class FleetComponent implements OnInit, OnDestroy {

  devicesList: IVehicle[];
  loadedDevicesList: IVehicle[] = [];
  view: string = 'cardView';
  loading: boolean = true;
  stopSubscriptions$: Subject<boolean> = new Subject();
  searchValue: string = null;
  isVisible: boolean = false;
  isOkLoading: boolean = false;
  columnDefs = columnDefs;
  vehicleForm: FormGroup;
  user: any;
  infoLoad: any = [];
  userlevelAccess: string;

  popupParent: any;

  constructor(private devicesService: DevicesService,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private messageService: NzMessageService,
    private rolService: RolService,
    private router: Router) {
    this.popupParent = document.querySelector('body');
  }

  ngOnInit() {
    this.authService.user.pipe(
      takeUntil(this.stopSubscriptions$),
      tap((user: any) => {
        this.getSubscriptions(user.vendorId);
        this.createForm();
      })
    ).subscribe(user => {
      this.user = user;
      //console.log(user);
      if (this.user.rolId != undefined) { // get rol assigned               
        this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
          this.infoLoad = item;
          this.userlevelAccess = this.infoLoad.optionAccessLavel;
        });
      }
    });
  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
  }

  ngOnDestroy() {
    this.stopSubscriptions$.next(false);
    this.stopSubscriptions$.complete();
  }

  getSubscriptions(vendorId) {
    this.devicesService.getDevices(vendorId).pipe(
      takeUntil(this.stopSubscriptions$),
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IVehicle;
        const id = a.payload.doc.id;
        return { id: id, ...data }
      }))
    ).subscribe((devices: IVehicle[]) => {
      this.devicesList = devices;
      this.loadedDevicesList = _.sortBy(devices, ['name', 'asc']);
      console.log(this.devicesList);
    })
  }

  searchByValue() {
    this.initializeList();
    const searchTerm = this.searchValue
    if (!searchTerm) {
      return;
    }
    this.devicesList = this.devicesList.filter((device: IVehicle) => {
      if (device.name && searchTerm) {
        if (device.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  initializeList(): void {
    this.devicesList = this.loadedDevicesList;
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  createForm() {
    this.vehicleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      licensePlates: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]],
      seats: [0, [Validators.required]],
      active: [true],
      disabled: [false]
    })
  }

  submitForm() {
    this.isOkLoading = true;
    console.log(this.vehicleForm.value);
    console.log(this.vehicleForm.valid);

    if (this.userlevelAccess != "3") {

      this.devicesService.addDevice(this.user.vendorId, this.vehicleForm.value).then(() => {
        this.isOkLoading = false;
        this.isVisible = false;
      })
        .catch(err => {
          this.isOkLoading = false;
          console.log(err);
        });
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para agregar datos, favor de contactar al administrador.");
    }


  }

  getContextMenuItems(params) {
    params.context = this;
    var result = [
      {
        name: 'Editar ' + params.node.data.name,
        action: () => {
          console.log(params);
          // this.router.navigate([`vehicle/edit/${params.node.data.name}`]);
        },
        cssClasses: ['redFont', 'bold'],
      },
      'separator',
      {
        name: 'Eliminar ' + params.node.data.name,
        action: function () {
          console.log(params);
          window.alert('Alerting about ' + params.value);
        },
        cssClasses: ['redFont', 'bold'],
      },
      {
        name: 'Desactivar',
        checked: true,
        action: function () {
          console.log('Checked Selected');
        },
        icon: '<img src="../images/skills/mac.png"/>',
      },
      'copy',
      'separator',
      'chartRange',
    ];
    return result;
  }
}
