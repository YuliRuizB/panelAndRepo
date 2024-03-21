import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomersService } from 'src/app/customers/services/customers.service';
import { columnDefs, rowGroupPanelShow } from 'src/app/customers/classes/customers';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { GridOptions } from 'ag-grid-community';

import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { map } from 'rxjs/operators';
//import { map, take, tap } from 'rxjs/operators';
//import * as firebase from 'firebase/app';
import { RolService } from 'src/app/shared/services/roles.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { query, where, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-shared-users-list',
  templateUrl: './list.component.html' 
})
export class SharedUsersListComponent implements OnInit, OnDestroy {

  @Input() accountId: string = '';
  @Input() accountName: string = '';

  sub: Subscription;
  usersList: any = [];
  columnDefs = columnDefs;
  rowGroupPanelShow = rowGroupPanelShow;
  gridOptions: GridOptions = this.getGridOptions();
  popupParent: any;
  pageSize: number = 10;

  //Modal
  isVisible: boolean = false;
  isConfirmLoading: boolean = false;

  //Wizard
  current = 0;
  index = 'First-content';

  //Ngx CSV Parser
  csvRecords: any[] = [];
  header = true;
  isSavingUsers: boolean = false;
  isDone: boolean = false;
  gridApi: any;
  gridColumnApi: any;
  infoLoad: any = [];
  userlevelAccess: string;
  user: any;
  accountsList;


  constructor(private usersService: CustomersService,
    private afs: AngularFirestore,
    private customersService: CustomersService,
    private msg: NzMessageService,
    private rolService: RolService,
    public authService: AuthenticationService,
    private ngxCsvParser: NgxCsvParser) {

    this.authService.user.subscribe((user) => {
      this.user = user;
      if (this.user.rolId != undefined) { // get rol assigned               
        this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
          this.infoLoad = item;
          this.userlevelAccess = this.infoLoad.optionAccessLavel;
        });
      }
    });
    this.popupParent = document.querySelector("body");
  }

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getSubscriptions() {
    this.sub = this.usersService.getAccountUsers(this.accountId).pipe(
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    )
      .subscribe((users) => {
        this.usersList = users;
        console.log(this.usersList)
      });
  }

  repairUsers() {
    this.usersList.forEach((user) => {

      const currentUserLocation = this.afs.doc(`/users/${user.id}`);
      const expectedUserLocation = this.afs.doc(`/users/${user.uid}`);

      if (user.uid == user.id) {
        console.log('skipped user: ', user);
      } else {
        expectedUserLocation.set(user, { merge: true }).then(() => {
          currentUserLocation.delete();
        });
      }

    });
  }
  sendMessage(type: string, message: string): void {
    this.msg.create(type, message);
  }
  deleteUsers() {
    if (this.userlevelAccess == "1") {
      this.usersList.forEach((user) => {
        console.log(user);
        this.usersService.deleteUser(user.id);
      });
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para borrar datos, favor de contactar al administrador.");
    }

  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getGridOptions(): GridOptions {
    return {
      columnDefs: columnDefs,
      context: {
        thisComponent: this
      },
      rowData: null,
      rowSelection: 'single',
      pagination: true,
      paginationPageSize: this.pageSize,
      defaultColDef: {
        sortable: true,
        filter: true,
        // Add more default column properties as needed
      },     
      statusBar: {
        statusPanels: [
          { statusPanel: 'agFilteredRowCountComponent' },
          { statusPanel: 'agSelectedRowCountComponent' },
          { statusPanel: 'agAggregationComponent' }
        ]
      },
      enableRangeSelection: true
    };
  }

  setPaginationPageSize(pageSize: number = 10) {
    this.pageSize = pageSize;
    console.log(this.gridApi);
    this.gridApi.paginationSetPageSize(Number(pageSize));
  }

  getContextMenuItems(params) {
    var result = [
      {
        name: "Ver detalles de " + params.node.data.firstName,
        action: () => {
          console.log(params);
          let context = params.context.thisComponent;
          const notification = context.afs.collection('testFCM').doc(params.value);
          notification.set({ name: 'hola' });
        },
        icon: '<nz-avatar nzIcon="user"></nz-avatar>',
        cssClasses: ["redFont", "bold"]
      },

      "separator",
      {
        name: "Checked",
        checked: true,
        action: function () {
          console.log("Checked Selected");
        },
        icon: '<img src="../images/skills/mac.png"/>'
      },
      "copy",
      "separator"
    ];
    return result;
  }

  //Modal
  showModal(): void {
    this.isVisible = true;
    this.isDone = false;
    this.isSavingUsers = false;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isSavingUsers = false;
    this.isVisible = false;
    this.csvRecords = [];
    this.current = 0;
    this.isDone = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
    this.csvRecords = [];
    this.current = 0;
    this.isDone = false;
  }

  //Wizard
  pre(): void {
    this.current -= 1;
    this.changeContent();
  }

  next(): void {
    this.current += 1;
    this.changeContent();
  }

  done(): void {
    this.isSavingUsers = true;

    if (this.userlevelAccess != "3") {
      this.csvRecords.forEach(user => {
        this.usersService.createUserWithoutApp(this.makeUserObject(user)).then((response: any) => {

          console.log(response);

          const userCreateBoardingPass = user.createBoardingPass //.toLowerCase() == 'true';
          console.log('create boarding pass: ', userCreateBoardingPass);

          if (userCreateBoardingPass) {
            user.uid = response;
            console.log('will create a boarding pass for this user');
            this.makeBoardingPassObject(user);
          }

          console.log(response);
          user.result = 'Creado'
        }).catch(err => {
          console.log(err);
          user.result = err.message;
        })

      });
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
    }


    this.isDone = true;
  }

  async makeBoardingPassObject(user: any) {
    console.log(user);

    let service;
    let route;
    let stopPoint;

    const servicesRef: AngularFirestoreCollection<any> = this.afs.collection('customers').doc(this.accountId).collection('products');
    const actualService = servicesRef.ref.where('name', '==', user.service);

    const routeRef = this.afs.collection('customers').doc(this.accountId).collection('routes');
    const actualRoute = routeRef.ref.where('name', '==', user.routeName);

    if (this.userlevelAccess != "3") {
      actualService.get().then(serviceQuerySnapshot => {
        const count = serviceQuerySnapshot.size;
        console.log('size of services found: ', count);
        if (count > 0) {
          serviceQuerySnapshot.forEach(doc => {
            const id = doc.id;
            const data = doc.data() as any;
            service = { id, ...data }
          });
        } else {
          return;
        }

        actualRoute.get().then(querySnapshot => {
          const count = querySnapshot.size;
          console.log('size of route found; ', count);
          if (count > 0) {
            querySnapshot.forEach(doc => {
              const id = doc.id;
              const data = doc.data() as any;
              route = { id, ...data }

             /*  const stopPointRef = firebase.firestore().collection('customers').doc(this.accountId).collection('routes').doc(route.id).collection('stops');
              const actualStop = stopPointRef.where('order', '==', +user.stop);

              actualStop.get().then(stopQuerySnapshot => {
                const count = stopQuerySnapshot.size;
                console.log('size of stop found; ', count);
                if (count > 0) {
                  stopQuerySnapshot.forEach(doc => {
                    const id = doc.id;
                    const data = doc.data() as any;
                    stopPoint = { id, ...data }
                  }); */
                  const stopPointRef = this.afs.collection('customers').doc(this.accountId).collection('routes').doc(route.id).collection('stops').ref;
                  const actualStop = query(stopPointRef, where('order', '==', +user.stop));

                  getDocs(actualStop).then((stopQuerySnapshot) => {
                    const count = stopQuerySnapshot.size;
                    console.log('size of stop found; ', count);

                    if (count > 0) {
                      stopQuerySnapshot.forEach((doc) => {
                        const id = doc.id;
                        const data = doc.data();
                        const stopPoint = { id, ...data };
                        // Do something with stopPoint
                      });
                    
                  console.log(service, route, stopPoint);


                  let boardingPassObject = {
                    active: user.validated,
                    amount: service.price,
                    authorization: '',
                    category: service.category,
                    conciliated: false,
                    creation_date: new Date().toISOString(),
                    currency: 'MXN',
                    customer_id: this.accountId,
                    date_created: new Date().toISOString(),
                    description: service.description,
                    due_date: new Date(service.validTo.toDate()).toISOString(),
                    name: service.name,
                    price: service.price,
                    product_description: service.description,
                    product_id: service.id,
                    realValidTo: new Date((service.validTo).toDate()).toISOString(),
                    error_message: "",
                    fee: {
                      amount: 0,
                      currency: "MXN",
                      tax: 0
                    },
                    isOpenpay: false,
                    isTaskIn: true,
                    isTaskOut: true,
                    is_courtesy: false,
                    method: "cash",
                    operation_date: new Date().toISOString(),
                    operation_type: "in",
                    order_id: "",
                    paidApp: "web",
                    payment_method: {
                      barcode_url: "",
                      reference: "",
                      type: "cash"
                    },
                    round: user.round,
                    routeId: route.id,
                    routeName: route.name,
                    status: 'completed',
                    stopDescription: stopPoint.description,
                    stopId: stopPoint.id,
                    stopName: stopPoint.name,
                    transaction_type: 'charge',
                    validFrom: service.validFrom,
                    validTo: service.validTo
                  };

                  console.log(boardingPassObject);

                  this.customersService.saveBoardingPassToUserPurchaseCollection(user.uid, boardingPassObject)
                    .then((success) => {
                      this.isVisible = false;
                      this.isConfirmLoading = false;
                    }).catch((err) => { this.isConfirmLoading = false; });
                  return;

                } else {
                  return;
                }
              });
            })
          } else {
            return;
          }

        })
      })
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
    }
    return;

  }

  makeUserObject(user: any) {
    let userObj = {
      _isEditMode: false,
      customerId: this.accountId,
      customerName: this.accountName,
      disabled: false,
      displayName: user.firstName + ' ' + user.lastName,
      email: user.email || '',
      emailVerified: false,
      firstName: user.firstName,
      lastName: user.lastName,
      lastUpdatedAt: new Date(),
      occupation: 'user',
      paid: false,
      phone: user.phone,
      phoneNumber: user.phone,
      photoURL: '',
      roles: ['user'],
      studentId: user.employeeId,
      uid: '',
      username: user.firstName,
      userRegisteredBy: 'fromWizard'
    }
    return userObj;
  }

  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    if (fileList.length == 0) {
      this.csvRecords = [];
    }
    if (status !== 'uploading') {
      console.log(file, fileList, event);
    }
    if (status === 'done') {
      this.msg.success(`${file.name} Se ha cargado con éxito.`);
      console.log(file);
      this.parser(file.originFileObj);

    } else if (status === 'error') {
      this.msg.error(`${file.name} no ha podido ser cargado.`);
    }
  }

  parser(file: File) {
    setTimeout(() => {
      this.ngxCsvParser.parse(file, { header: this.header, delimiter: ',' })
        .pipe().subscribe((result: Array<any>) => {

          console.log('Result', result);
          // this.csvRecords = result;
          this.sanitizeResults(result);
        }, (error: NgxCSVParserError) => {
          console.log('Error', error);
        });
    }, 100);

  }

  sanitizeResults(results) {
    let sanitizedResults = [];
    for (const result of results) {
      const createBoardingPass = result.createBoardingPass.toLowerCase() === 'true';
      const newResult = Object.assign(result);
      newResult.createBoardingPass = createBoardingPass;
      sanitizedResults.push(newResult);
    }
    this.csvRecords = sanitizedResults;
    console.log(this.csvRecords);

  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.index = 'First-content';
        break;
      }
      case 1: {
        this.index = 'Second-content';
        break;
      }
      case 2: {
        this.index = 'third-content';
        break;
      }
      default: {
        this.index = 'error';
      }
    }
  }

}