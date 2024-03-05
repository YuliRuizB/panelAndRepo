import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as _ from 'lodash';
import { CustomersService } from 'src/app/customers/services/customers.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { IStopPoint } from 'src/app/shared/interfaces/route.type';
import { NzMessageService } from 'ng-zorro-antd';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { RolService } from 'src/app/shared/services/roles.service';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GlobalUsersListComponent implements OnInit, OnDestroy {

  @ViewChild('searchBar', { static: false }) searchbar;
  @ViewChild('searchBarDrive', { static: false }) searchbarDrive;

  devicesList: any;
  devicesListDrive: any;
  loadedDevicesList: Array<any> = [];
  loadedDevicesListDrive: Array<any> = [];
  currentUserSelected;
  currentDriverSelected;
  currentSelectedCustomerId;
  accountId$ = new Subject<string>();
  routeId$ = new Subject<string>();
  isUserSelected = false;
  isDriverSelected = false;
  isBoardingPassSelected = false;
  validateEditForm: UntypedFormGroup;
  stopPointsList: any = [];
  isEditUserVisible = false;
  isCustomersVisible = false;
  userRoutes: any = [];
  fileListInfo: any = [];
  newCustomerIdEditMode: string = "";
  isConfirmLoading: boolean = false;
  resetClientEditInfo: boolean = false;
  isVisible = false;
  isLoadingUsers = false;
  isLoadingDrivers = false;
  usersByAccount: any = [];
  usersCollection: AngularFirestoreCollection<any>;
  driversCollection: AngularFirestoreCollection<any>;
  rolCollection: AngularFirestoreCollection<any>;
  users: any;
  rolesName: any;
  hasBeenFiltered = false;
  displayData;
  displayDataDriver;
  roles: any[];
  rolSuscription: Subscription;
  RolesArray: any;
  rolesperUser: string;
  rolesperUserAplicacion: string;
  infoLoad: any = [];
  vendorinfo: any = [];
  vendorName: string = "";
  userinfoLoad: any = [];
  userlevelAccess: string;
  user: any;

  stopSubscription$: Subject<any> = new Subject();

  constructor(private customersService: CustomersService,
    private afs: AngularFirestore,
    private routesService: RoutesService,
    private rolesService: RolService,
    private msg: NzMessageService,
    private vendorService: VendorService,
    public authService: AuthenticationService,
    private fb: UntypedFormBuilder) {
    this.authService.user.subscribe((user) => {
      this.user = user;
      if (this.user.rolId != undefined) { // get rol assigned               
        this.rolesService.getRol(this.user.rolId).valueChanges().subscribe(item => {
          this.infoLoad = item;
          this.userlevelAccess = this.userinfoLoad.optionAccessLavel;
        });
      }
    });

  }



  ngOnInit() {
    const routesObservable = this.accountId$.pipe(
      switchMap(accountId => this.afs.collection('customers').doc(accountId).collection('routes', ref => ref.where('active', '==', true)).valueChanges({ idField: 'routeId' })
      ));
    const usersObservable = this.accountId$.pipe(
      switchMap(accountId => this.afs.collection('users', ref => ref.where('customerId', '==', accountId).orderBy('studentId')).valueChanges({ idField: 'uid' })
      ));
    const rolSuscription = this.accountId$.pipe(
      switchMap(accountId => this.afs.collection('roles', ref => ref.where('active', '==', true)).valueChanges({ idField: 'uid' })
      ));

    usersObservable.subscribe((usersByAccount: any) => {
      this.usersByAccount = usersByAccount;
    })

    rolSuscription.subscribe((roles: any) => {
      this.roles = roles;
    });
    this.getUsersList();
    this.getDriversList();

    this.validateEditForm = this.fb.group({
      rolId: [''],
      roles: ['']
    });

  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }

  initializeItems() {
    this.devicesList = this.loadedDevicesList;
    this.devicesListDrive = this.loadedDevicesListDrive;
  }

  getUsersList() {
    this.isLoadingUsers = true;
    this.usersCollection = this.afs.collection<any>('users', ref => ref.orderBy('displayName'));
    //  this.afs.collection<any>('users', ref => ref.where('disabled', '==', false).orderBy('displayName'));
    this.users = this.usersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe(users => {
      this.loadUsers(users);
    });
  }
  getDriversList() {
    this.isLoadingDrivers = true;
    this.driversCollection = this.afs.collection<any>('drivers', ref => ref.orderBy('displayName'));
    //  this.afs.collection<any>('users', ref => ref.where('disabled', '==', false).orderBy('displayName'));
    this.users = this.driversCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe(drivers => {
      this.loadDrivers(drivers);
    });
  }

  loadUsers(users) {
    if (this.loadedDevicesList.length <= 1) {
      this.displayData = users;
      this.devicesList = _.orderBy(JSON.parse(JSON.stringify(users)), ['displayName'], ['asc']);
      this.loadedDevicesList = this.devicesList;
    }
  }
  loadDrivers(drivers) {
    if (this.loadedDevicesListDrive.length <= 1) {
      this.displayDataDriver = drivers;
      this.devicesListDrive = _.orderBy(JSON.parse(JSON.stringify(drivers)), ['displayName'], ['asc']);
      this.loadedDevicesListDrive = this.devicesListDrive;
    }
  }

  getItems(searchbar) {
    this.initializeItems();
    const q = searchbar;
    if (!q) { return; }
    const text = _.toLower(q);
    this.devicesList = _.filter(this.devicesList, function (object) {
      return _(object).some(function (string) {
        return _(string).toLower().includes(text);
      });
    });
  }

  getItemsDrive(searchbarDrive) {
    this.initializeItems();
    const q = searchbarDrive;
    if (!q) { return; }
    const text = _.toLower(q);
    this.devicesListDrive = _.filter(this.devicesListDrive, function (object) {
      return _(object).some(function (string) {
        return _(string).toLower().includes(text);
      });
    });
  }



  userSelected(data) {
    this.rolesperUser = "";
    this.rolesperUserAplicacion = "";
    this.currentUserSelected = data;
    this.RolesArray = data.roles;
    this.rolesperUserAplicacion = this.RolesArray.join(', ');
    if (data.rolId != undefined) {
      if (data.rolId.length > 0) {
        this.rolesService.getRol(data.rolId).valueChanges().subscribe(item => {
          this.infoLoad = item;
          this.rolesperUser = this.infoLoad.description;
        });

      }
    }
    this.currentSelectedCustomerId = this.currentUserSelected.customerId;
    this.isBoardingPassSelected = false;
    this.accountId$.next(this.currentUserSelected.customerId);
    this.isUserSelected = true;
    // this.isDriverSelected = false;
  }
  driverSelected(data) {
    this.vendorName = "";
    this.rolesperUser = "";
    this.rolesperUserAplicacion = "";
    this.currentDriverSelected = data;
    this.RolesArray = data.roles;
    this.rolesperUserAplicacion = this.RolesArray.join(', ');
    if (data.rolId != undefined) {
      if (data.rolId.length > 0) {
        this.rolesService.getRol(data.rolId).valueChanges().subscribe(item => {
          this.infoLoad = item;
          this.rolesperUser = this.infoLoad.name;
        });

      }
    }
    if (data.vendorId != undefined) {
      this.vendorService.getVendor(data.vendorId).pipe(
        map(a => {
          const id = a.payload.id;
          const data = a.payload.data() as any;
          return { id: id, ...data }
        })
      ).subscribe((vendor) => {
        this.vendorinfo = vendor;
        this.vendorName = this.vendorinfo.name;
      });
    }
    this.isBoardingPassSelected = false;
    this.isDriverSelected = true;
    // select vendor vendorId
    //console.log(data);
  }

  setUserDisabled(disabled) {
    this.customersService.setUserDisabled(this.currentUserSelected.uid, disabled);
    this.currentUserSelected.disabled = disabled;
  }
  nzClicOptionInformacion() {
    this.isBoardingPassSelected = false;
  }

  showModalEditUser(currentUserSelected) {
    this.isEditUserVisible = true;
    console.log(currentUserSelected);
  }

  showModalEditDriver(currentUserSelected) {
    this.isEditUserVisible = false;
    console.log(currentUserSelected);
  }

  showModalCustomer() {
    // this.isCustomersVisible = true;
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    console.log("cancel");
    this.isEditUserVisible = false;
    // this.isCustomersVisible = false;
  }

  submitForm(): void {

  }

  submitEditForm(): void {
    console.log(this.validateEditForm);
    const rolId = this.validateEditForm.controls['rolId'].value == undefined ? "" : this.validateEditForm.controls['rolId'].value;
    const uid = this.currentUserSelected.uid;
    let validForm: boolean = true;
    const data = {
      uid: uid,
      rolId: rolId
    };
    console.log(data);

    if (validForm) {
      if (this.userlevelAccess != "3") {
        this.rolesService.updateUserRol(this.currentUserSelected.uid, data)
          .then((success) => {
            this.isEditUserVisible = false;
          }).catch((err) => { console.log("error: " + err); });
      } else {
        this.msg.error("El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
      }

    } else {
      this.msg.success("El Formulario no es valido favor de validar");
    }
  }
  submitCustomerForm(): void {

  }
}




