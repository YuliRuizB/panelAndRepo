import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { takeUntil, map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IBaseProgram } from 'src/app/shared/interfaces/program.type';
import { IStopPoint } from 'src/app/shared/interfaces/route.type';
import * as _ from 'lodash';
import { AssignmentType } from 'src/app/shared/interfaces/assignment.type';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { IVendor } from 'src/app/shared/interfaces/vendor.type';
import { NzMessageService } from 'ng-zorro-antd';
import { RolService } from 'src/app/shared/services/roles.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-shared-route-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})
export class SharedRouteProgramsComponent implements OnInit, OnDestroy {

  @Input() accountId: string;
  @Input() routeId: string;
  loading: boolean = true;

  stopSubscription$: Subject<any> = new Subject();
  programsList: any = [];
  stopPointsList: any = [];
  vendorsList: any = [];

  isCreateVisible: boolean = false;
  isEditMode: boolean = false;
  currentSelectedId: string;
  programForm: FormGroup;
  assigmentType: AssignmentType
  infoLoad: any = [];
  userlevelAccess: string;
  user: any;


  constructor(
    private routesService: RoutesService,
    private vendorsService: VendorService,
    private messageService: NzMessageService,
    private rolService: RolService,
    private userService: UsersService,
    public authService: AuthenticationService,
    private fb: FormBuilder
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
    this.createForm();
    console.log(this.assigmentType);
  }
  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
  }
  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }

  getSubscriptions() {

    this.routesService.getRouteAssignments(this.accountId, this.routeId).pipe(
      takeUntil(this.stopSubscription$),
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as IBaseProgram;
        return { id, ...data }
      })))
      .subscribe((programs: IBaseProgram[]) => {
        this.programsList = programs;
        this.loading = false;
      });

    this.routesService.getRouteStopPoints(this.accountId, this.routeId).pipe(
      takeUntil(this.stopSubscription$),
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as IStopPoint;
        return { id, ...data }
      })))
      .subscribe((stopPoints: IStopPoint[]) => {
        this.stopPointsList = stopPoints;
        this.loading = false;
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
        this.loading = false;
      });
  }

  createForm() {
    this.programForm = this.fb.group({
      active: [false, [Validators.required]],
      acRequired: [false, [Validators.required]],
      isSunday: [false, [Validators.required]],
      isMonday: [true, [Validators.required]],
      isTuesday: [true, [Validators.required]],
      isWednesday: [true, [Validators.required]],
      isThursday: [true, [Validators.required]],
      isFriday: [true, [Validators.required]],
      isSaturday: [false, [Validators.required]],
      program: ['', [Validators.required]],
      round: ['', [Validators.required]],
      stopBeginId: ['', [Validators.required]],
      stopBeginName: ['', [Validators.required]],
      stopBeginHour: ['', [Validators.required]],
      stopEndId: ['', [Validators.required]],
      stopEndName: ['', [Validators.required]],
      stopEndHour: ['', [Validators.required]],
      time: [new Date(), [Validators.required]],
      type: [this.assigmentType, [Validators.required]],
      customerName: ['', [Validators.required]],
      customerId: [this.accountId, [Validators.required]],
      vendorName: ['', [Validators.required]],
      vendorId: ['', [Validators.required]],
      routeId: [this.routeId, [Validators.required]]
    })
  }

  patchForm(data) {
    this.programForm.patchValue({
      active: data.active,
      acRequired: data.acRequired,
      isSunday: data.isSunday,
      isMonday: data.isMonday,
      isTuesday: data.isTuesday,
      isWednesday: data.isWednesday,
      isThursday: data.isThursday,
      isFriday: data.isFriday,
      isSaturday: data.isSaturday,
      program: data.program,
      round: data.round,
      stopBeginId: data.stopBeginId,
      stopBeginName: data.stopBeginName,
      stopBeginHour: data.stopBeginHour,
      stopEndId: data.stopEndId,
      stopEndName: data.stopEndName,
      stopEndHour: data.stopEndHour,
      time: (data.time).toDate(),
      type: data.type,
      customerName: data.customerName,
      customerId: this.accountId,
      vendorName: data.vendorName,
      vendorId: data.vendorId,
      routeId: this.routeId
    });
  }

  toggleActive(data) {
    this.routesService.toggleRouteAssignment(this.accountId, this.routeId, data.id, data).then(() => {
      this.isCreateVisible = false;
      this.isEditMode = false;
    })
      .catch(err => console.log(err));
  }

  showCreateModal() {
    this.isCreateVisible = true;
    this.currentSelectedId = null;
  }

  showModalDelete(data) {
    console.log(data);
    if (this.userlevelAccess == "1") {
      this.routesService.deleteRouteAssignments(this.accountId, this.routeId, data.id).then(() => {
        this.isCreateVisible = false;
        this.isEditMode = false;
      })
        .catch(err => console.log(err));
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para borrar datos, favor de contactar al administrador.");
    }

  }

  showModalEdit(data) {
    this.patchForm(data);
    this.currentSelectedId = data.id;
    this.isCreateVisible = true;
    this.isEditMode = true;
  }

  handleCancel() {
    this.isCreateVisible = false;
    this.isEditMode = false;
    this.currentSelectedId = null;
  }

  createProgram() {
    this.programForm.get('customerId').setValue(this.accountId);
    this.programForm.get('routeId').setValue(this.routeId);
    if (this.userlevelAccess != "3") {
      if (!this.isEditMode) {
        this.routesService.setRouteAssignments(this.accountId, this.routeId, this.programForm.value).then(() => {
          this.isCreateVisible = false;
          this.isEditMode = false;
        })
          .catch(err => console.log(err));
      } else {
        this.routesService.updateRouteAssignment(this.accountId, this.routeId, this.currentSelectedId, this.programForm.value).then(() => {
          this.isCreateVisible = false;
          this.isEditMode = false;
          this.currentSelectedId = null;
        })
          .catch(err => console.log(err));
      }
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
    }


  }

  checkChange(formControl: string, event: boolean) {
    this.programForm.controls[formControl].setValue(event);
    console.log(this.programForm.value);
  }

  onStopPointSelected(event, field, time) {
    if (event) {
      const recordArray = _.filter(this.stopPointsList, s => {
        return s.id == event;
      });
      const record = recordArray[0];
      console.log(record);
      let round = this.programForm.controls['round'].value;
      console.log(round);
      this.programForm.controls[field].setValue(record.name);
      switch (round) {
        case 'Día':
          this.programForm.controls[time].setValue(record.round1);
          break;
        case 'Tarde':
          this.programForm.controls[time].setValue(record.round2);
          break;
        default:
          this.programForm.controls[time].setValue(record.round1);
          break;
      }
    }
  }

  onVendorSelected(event, field) {
    if (event) {
      const recordArray = _.filter(this.vendorsList, s => {
        return s.id == event;
      });
      const record = recordArray[0];
      console.log(record);
      this.programForm.controls[field].setValue(record.name);
    }
  }

}
