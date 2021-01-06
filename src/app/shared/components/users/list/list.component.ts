import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomersService } from 'src/app/customers/services/customers.service';
import { columnDefs, rowGroupPanelShow } from 'src/app/customers/classes/customers';
import { AngularFirestore } from '@angular/fire/firestore';
import { GridOptions } from 'ag-grid-community';

import { NzMessageService } from 'ng-zorro-antd/message';
import { UploadChangeParam, UploadFile } from 'ng-zorro-antd/upload';

import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { map, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-shared-users-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
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

  constructor(private usersService: CustomersService, private afs: AngularFirestore, private msg: NzMessageService, private ngxCsvParser: NgxCsvParser) {
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
      map(actions => actions.map(a => {
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

    // const boardingPassRef = this.afs.doc('/users/0BaGqU6pwlV4YJOpDgrn/boardingPasses/bCR06CvuWUSHuQwndrNH');
    // boardingPassRef.snapshotChanges().pipe(
    //   take(1),
    //   map(a => {
    //     const id = a.payload.id;
    //     const data = a.payload.data() as any;
    //     return { id, ...data }
    //   }),
    //   tap(boardingPass => {
    //     const boardingPassDoc = boardingPass;
    //     const boardingPassNewRef = this.afs.doc(`/users/M8n8uC7dVL3pr4nEevMO/boardingPasses/bCR06CvuWUSHuQwndrNH`);
    //     return boardingPassNewRef.set(boardingPassDoc, { merge: true})
    //   })
    // ).subscribe();

    // this.usersService.updateUser(this.usersList[0].uid, this.usersList[0]).then((response) => {
    //   this.usersService.deleteUser(this.usersList[0].id);
    // });
    // this.usersList.forEach( (user) => {
    //   console.log(user);
    //   this.usersService.updateUser(user.uid, user).then( (response) => {
    //     this.usersService.deleteUser(user.id);
    //   });
    // });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getGridOptions() {
    return {
      columnDefs: columnDefs,
      context: {
        thisComponent: this
      },
      rowData: null,
      rowSelection: 'single',
      pagination: true,
      paginationPageSize: this.pageSize,

      enableFilter: true,
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
    this.csvRecords.forEach(user => {

      this.usersService.createUserWithoutApp(this.makeUserObject(user)).then(response => {
        console.log(response);
        user.result = 'Creado'
      }).catch(err => {
        console.log(err);
        user.result = err.message;
      })

    });
    this.isDone = true;
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

  handleChange({ file, fileList }: UploadChangeParam): void {
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
          this.csvRecords = result;
        }, (error: NgxCSVParserError) => {
          console.log('Error', error);
        });
    }, 100);

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