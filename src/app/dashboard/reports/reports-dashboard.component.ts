import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup } from '@angular/fire/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { UsersService } from 'src/app/shared/services/users.service';
import * as _ from 'lodash';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { GridReadyEvent, SideBarDef } from 'ag-grid-community';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { IStopPoint } from 'src/app/shared/interfaces/route.type';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.css']
})
export class ReportsDashboardComponent implements OnInit {
  
  stopSubscription$: Subject<any> = new Subject();
  gridApi;
  gridColumnApi;
  columnDefs;
  columnDefsPagos;
  defaultColDef;
  userRoutes:any;
  sumOfField = 0;
  detailCellRendererParams;
  detailCellRendererParamsPagos;
  usersColumnDefs;
  usersColumnDefsAnticipo;
  usersColumnDefsCV;
  usersColumnDefsCVDetalle;
  columnProgram;
  rowData: any = [];
  rowDataPay: any = [];
  rowDataPayTurn:any= [];
  rowDataPayCV:any= [];
  rowDataPayCVByR: any  = [];
  TotalUsers:number =0;
  TotalMPP :number=  0;
  TotalMPByRoute:number=0;
  user: any;
  usersList: any = [];
  usersListA: any = [];
  usersListCV : any = [];
  usersListCVByR : any [];
  usersListCVByRDetalle:any [];
  FusersListCVByRDetalle:any [];
  routesList: any = [];
  products: any = [];
  amountCV:number=0;
  priceCV:number=0;
  productsSubscription: Subscription;
  accountId$ = new Subject<string>();
  joined$: Observable<any>;
  cCollection: AngularFirestoreCollectionGroup<any>;
  productsListV:any;
  validateForm: FormGroup;
  validateFormTurn:FormGroup;
  validateFormPase: FormGroup;
  validateFormAnticipos:FormGroup;
  validateFormCV:FormGroup;
  validateFormCVByRoute:FormGroup;
  signupForm: FormGroup;
  signupFormCV:FormGroup;
  shift: any = [];
  public rowSelection = 'multiple';
  isModalVisible: boolean = false;
  isModalVisibleCV:boolean = false;
  public sideBar: SideBarDef | string | string[] | boolean | null = 'filters';
  accountsSubscription: Subscription;
 routeSubscription: Subscription;
 routes:any;
 routeIdSelected:string;

  constructor(  private usersService: UsersService, 
      private productsService: ProductsService ,
      private fb: FormBuilder,
      private routesService: RoutesService,
      private msg: NzMessageService,
      private authService: AuthenticationService,
      private afs: AngularFirestore) { 

        this.validateForm = this.fb.group({
          id: [null], // Initialize the product_id control
        });
        this.validateFormPase = this.fb.group({
          id: [null], // Initialize the product_id control
        });
        this.validateFormTurn = this.fb.group({
          id: [null], // Initialize the product_id control
          turno: [""]
        });
        this.validateFormAnticipos = this.fb.group({
          id: [null], // Initialize the product_id control
          turno: [""]
        });

        this.validateFormCV =  this.fb.group({
          id: [null] 
        });

        
        this.validateFormCVByRoute =  this.fb.group({
          id: [null] ,
          routeId:[""]
        });

        this.signupForm = this.fb.group({
          id: [],
          customerName: [''],
          defaultRound: [''],
          defaultRouteName: [''],
          displayName: [''],
          email:[''],
          firstName: [''],
          lastName:[''],
          phone: [''],
          studentId: ['']
          });

          this.signupFormCV = this.fb.group({
            id: [],
            customerName: [''],
            defaultRound: [''],
            defaultRouteName: [''],
            displayName: [''],
            email:[''],
            firstName: [''],
            lastName:[''],
            phone: [''],
            studentId: ['']
            });
  
        this.shift = [
          { id: 'Día', name: 'Día' },
          { id: 'Tarde', name: 'Tarde' },
          { id: 'Noche', name: 'Noche' }
        ];

    const productsObservable = this.accountId$.pipe(
      switchMap(accountId => this.afs.collection('customers').doc(accountId).collection('products', ref => ref.where('active', '==', true)).valueChanges({ idField: 'productId' })
      ));
       
    this.columnDefs = [
      {
        headerName: 'Empresa', field: 'customerName',
        cellRenderer: 'agGroupCellRenderer', sortable: true
      },
      { headerName: 'Ruta', sortable: true, field: 'routeName' },
      { headerName: 'Usuarios Mete', field: 'customerName', cellRenderer: (params) => {
        const passes = params.data.passes;
       /*  const isTaskIn = _.filter(passes, (p) => {
          return !!p.isTaskIn;
        })
        return isTaskIn.length; */
        return passes;
      }},
      { headerName: 'Usuarios Saca', field: 'customerName', cellRenderer: (params) => {
        const passes = params.data.passes;
       /*  const isTaskOut = _.filter(passes, (p) => {
          return !!p.isTaskOut;
        }) */
        return passes; //isTaskOut.length;
      }},
      { headerName: 'Activa', field: 'permission', cellRenderer: (params) => {
        return !!params.value ? 'Si' : 'No'
      }}
    ];
    this.columnDefsPagos = [
      {
        headerName: 'Empresa', field: 'customerName',
        cellRenderer: 'agGroupCellRenderer', sortable: true
      },
      { headerName: 'Ruta', sortable: true, field: 'routeName' },
      { headerName: 'Usuarios', aggFunc: 'sum', filter: true, sortable: true, field: 'customerName', cellRenderer: (params) => {
        const passes = params.data.passes;
        const rowCount = passes.reduce((accumulator) => {
          return accumulator + 1;
        }, 0);
        return rowCount;
      }},

     
      { headerName: 'Monto', aggFunc: 'sum', field: 'customerName', cellRenderer: (params) => {
        const passes = params.data.passes;
        const totalAmount = passes.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.amount;
        }, 0);
        const formattedAmount = totalAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD' // Change 'USD' to the appropriate currency code if needed
        });

        return formattedAmount; 
        //return passes;
      }},     
      { headerName: 'Activa', field: 'permission', cellRenderer: (params) => {
        return !!params.value ? 'Si' : 'No'
      }}
    ];
    this.columnProgram = [
      {
        headerName: 'Inicia', field: 'time',
        cellRenderer: 'agGroupCellRenderer', sortable: true
      },
      { headerName: 'Empresa', sortable: true, field: 'customerName' },
      { headerName: 'Ruta', sortable: true, field: 'routeName'},
      { headerName: 'Programa / Turno', Field: 'round'},
      { headerName: 'PR', sortable: true, field: 'driver'},
      { headerName: 'Vehículo', sortable: true, field: 'vehicleName'},
      { headerName: 'Inició', sortable: true, field: 'startedAt'},
      { headerName: 'Finalizó', sortable: true, field: 'endedAt'}
    ];
    this.usersColumnDefs = [
      { headerName: 'Empresa', field: 'customerName', enableRowGroup: true },
      { headerName: 'Ruta', field: 'routeName', enableRowGroup: true },
      { headerName: 'Turno', field: 'round', enableRowGroup: true },
      { headerName: 'Estación', field: 'stopName', enableRowGroup: true },
      { headerName: 'Pase de abordar', field: 'name' },
      { headerName: 'Mete', field: 'isTaskIn', cellRenderer: (params) => {
        return !!params.value ? 'Si' : 'No'
      }},
      { headerName: 'Saca', field: 'isTaskOut', cellRenderer: (params) => {
        return !!params.value ? 'Si' : 'No'
      }},
      { headerName: 'Pase Cortesía', field: 'is_courtesy', cellRenderer: (params) => {
        return !!params.value ? 'Si':'No'
      }},
      { headerName: 'Válido desde', field: 'validFrom', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }},
      { headerName: 'Válido hasta', field: 'validTo', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }}
    ];
    this.usersColumnDefsAnticipo = [
      { headerName: 'Empresa',width: 200, field: 'customerName', enableRowGroup: true },
      { headerName: 'Ruta',width: 200,field: 'routeName', enableRowGroup: true },
      { headerName: 'Turno',  width: 100,  field: 'round', enableRowGroup: true },
      { headerName: 'Monto Anticipo',   enableRowGroup: true,field: 'amountPayment', cellRenderer: (params) => {       
        const totalAmount = params.data.amountPayment;       
        const formattedAmount = totalAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD' // Change 'USD' to the appropriate currency code if needed
        });
        return formattedAmount; 
      }},       
      { headerName: 'Promesa  de Pago', field: 'promiseDate', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }},   
      {
        headerName: 'Días vencidos',
       
        field: 'promiseDate',
        cellRenderer: (params) => {
          const promiseTimestamp = params.value; // Firestore Timestamp
          const promiseDate = promiseTimestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
          const today: Date = new Date(); // Explicitly declare the type as Date
          const timeDifference = promiseDate.getTime() - today.getTime(); // Calculate the time difference in milliseconds
          const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
          return daysDifference + ' días';
        }
      },   
      { headerName: 'Pase de abordar', field: 'name' },
      { headerName: 'Mete / Saca / Cortesía', field: 'isTaskIn', width: 210, cellRenderer: (params) => {
        const meteSacaText = !!params.data.isTaskIn ? 'Si' : 'No';
        const sacaText = !!params.data.isTaskOut ? 'Si' : 'No';
        const cortesiaText = !!params.data.is_courtesy ? 'Si' : 'No';
        return ` ${meteSacaText} / ${sacaText} / ${cortesiaText}`;
      }},  
      { headerName: 'Válido desde', field: 'validFrom', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }},
      { headerName: 'Válido hasta', field: 'validTo', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }}
    ];

    this.usersColumnDefsCV = [
      { headerName: 'Empresa',width: 200, field: 'customerName', enableRowGroup: true },
      { headerName: 'Ruta',width: 200,field: 'routeName', enableRowGroup: true },      
      { headerName: 'Turno',  width: 100,  field: 'round', enableRowGroup: true },
      { headerName: 'Monto Anticipo',  enableRowGroup: true,field: 'amountPayment', cellRenderer: (params) => {       
        const totalAmount = params.data.amountPayment;       
        const formattedAmount = totalAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD' // Change 'USD' to the appropriate currency code if needed
        });
        return formattedAmount; 
      }},  

      { headerName: 'Pendiente de Pago',  cellRenderer: (params) => {       
        const totalAmount = params.data.amount - params.data.amountPayment;       
        const formattedAmount = totalAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD' // Change 'USD' to the appropriate currency code if needed
        });
        return formattedAmount; 
      }},     
      { headerName: 'Promesa  de Pago', field: 'promiseDate', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }},   
      {
        headerName: 'Días vencidos',       
        field: 'promiseDate',
        cellRenderer: (params) => {
          const promiseTimestamp = params.value; // Firestore Timestamp
          const promiseDate = promiseTimestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
          const today: Date = new Date(); // Explicitly declare the type as Date
          const timeDifference = promiseDate.getTime() - today.getTime(); // Calculate the time difference in milliseconds
          const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
          return daysDifference + ' días';
        }
      },   
      { headerName: 'Pase de abordar', field: 'name' },
      { headerName: 'Mete / Saca / Cortesía', field: 'isTaskIn', width: 210, cellRenderer: (params) => {
        const meteSacaText = !!params.data.isTaskIn ? 'Si' : 'No';
        const sacaText = !!params.data.isTaskOut ? 'Si' : 'No';
        const cortesiaText = !!params.data.is_courtesy ? 'Si' : 'No';
        return ` ${meteSacaText} / ${sacaText} / ${cortesiaText}`;
      }},  
      { headerName: 'Válido desde', field: 'validFrom', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }},
      { headerName: 'Válido hasta', field: 'validTo', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }}
    ];
    this.usersColumnDefsCVDetalle = [ 
      { headerName: 'Nombre',width: 300,field: 'displayName' },  
      { headerName: 'Matricula',width: 140,field: 'studentId'},  
      { headerName: 'Telefono',width: 140,field: 'phone'},  
      { headerName: 'Correo',width: 300,field: 'email'},
     { headerName: 'Monto Anticipo',field: 'amountPayment', cellRenderer: (params) => {       
        const totalAmount = params.data.amountPayment;       
        const formattedAmount = totalAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD' // Change 'USD' to the appropriate currency code if needed
        });
        return formattedAmount; 
      }},  
      { headerName: 'Pendiente de Pago',  cellRenderer: (params) => {       
        const totalAmount = params.data.amount - params.data.amountPayment;       
        const formattedAmount = totalAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD' // Change 'USD' to the appropriate currency code if needed
        });
        return formattedAmount; 
      }}, 
      { headerName: 'Promesa  de Pago', field: 'promiseDate', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }},  
      {
        headerName: 'Días vencidos',       
        field: 'promiseDate',
        cellRenderer: (params) => {
          const promiseTimestamp = params.value; // Firestore Timestamp
          const promiseDate = promiseTimestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
          const today: Date = new Date(); // Explicitly declare the type as Date
          const timeDifference = promiseDate.getTime() - today.getTime(); // Calculate the time difference in milliseconds
          const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
          return daysDifference + ' días';
        }
      } 
    ];

    this.defaultColDef = {
      flex: 1,
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
     };
     this.detailCellRendererParams = {
      detailGridOptions: {
        columnDefs: [
          { headerName: 'Pase de abordar', field: 'name' },
          { headerName: 'Mete / Saca / Cortesía', field: 'isTaskIn', width: 210, cellRenderer: (params) => {
            const meteSacaText = !!params.data.isTaskIn ? 'Si' : 'No';
            const sacaText = !!params.data.isTaskOut ? 'Si' : 'No';
            const cortesiaText = !!params.data.is_courtesy ? 'Si' : 'No';
            return ` ${meteSacaText} / ${sacaText} / ${cortesiaText}`;
          }},  
          { headerName: 'Estación', field: 'stopName' },
          { headerName: 'Válido desde', field: 'validFrom', cellRenderer: (params) => {
            const date = (params.value).toDate();
            return format(date, 'MMMM dd yyyy', {
              locale: es
            })
          }},
          { headerName: 'Válido hasta', field: 'validTo', cellRenderer: (params) => {
            const date = (params.value).toDate();
            return format(date, 'MMMM dd yyyy', {
              locale: es
            })
          }}
        ],
        defaultColDef: { flex: 1 },
      },
      getDetailRowData: function (params) {
        params.successCallback(params.data.passes);
      },
    };
    this.detailCellRendererParamsPagos = {
      detailGridOptions: {
        columnDefs: [
          { headerName: 'Pase de abordar', field: 'name' , width: 250},
          { headerName: 'Mete / Saca / Cortesía', field: 'isTaskIn', width: 210, cellRenderer: (params) => {
            const meteSacaText = !!params.data.isTaskIn ? 'Si' : 'No';
            const sacaText = !!params.data.isTaskOut ? 'Si' : 'No';
            const cortesiaText = !!params.data.is_courtesy ? 'Si' : 'No';
            return ` ${meteSacaText} / ${sacaText} / ${cortesiaText}`;
          }},                 
          { headerName: 'Pago', width: 140, field: 'payment' },
          { headerName: 'Tipo de Pago', width: 145, field: 'typePayment' },
          { headerName: 'Monto', field: 'amount' , width: 120} , 
          { headerName: 'Status', field: 'status' , width: 130,cellRenderer: (params) => {  
            const statusText = params.data.status;
            if (statusText !== 'completed') {return 'Pago Parcial'} else  { return'Completo'}
            return statusText;
          }},
          { headerName: 'Válido desde', field: 'validFrom', width: 130,cellRenderer: (params) => {
            const date = (params.value).toDate();
            return format(date, 'MMMM dd yyyy', {
              locale: es
            })
          }},
          { headerName: 'Válido hasta', field: 'validTo', width: 130, cellRenderer: (params) => {
            const date = (params.value).toDate();
            return format(date, 'MMMM dd yyyy', {
              locale: es
            })
          }}
        ],
        defaultColDef: { flex: 1 },
      },
      getDetailRowData: function (params) {
        params.successCallback(params.data.passes);
      },
    };
    productsObservable.subscribe((products: any) => {      
    //  this.products = products;
     // console.log("entro ");
     // console.log(this.products);
    });  

   
  }

 
  ngOnInit() {
  
    this.authService.user.subscribe((user: any) => {   
      this.user = user;
      this.getSubscriptionsByRoute(user.vendorId);
      this.cCollection = this.afs.collectionGroup<any>('products', ref => ref.where('active','==',true));
      this.productsListV = this.cCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data() as any;
          return { id, ...data }
        }))
      ).subscribe(productsList => {        
        this.products = productsList;      
      //  console.log(this.products);
      });
    }); 
  }

  onFirstDataRendered(params) {
    setTimeout(function () {
     // params.api.getDisplayedRowAtIndex(1).setExpanded(false);
    }, 0);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.rowData = this.routesList;
    //params.api.getToolPanelInstance('filters')!.expandFilters();
  }
  onGridReadyD(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
 
  ngOnDestroy() {
   
    if (this.stopSubscription$) {
      this.stopSubscription$.next();
    this.stopSubscription$.complete();
    }
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
    if (this.accountsSubscription) {
    this.accountsSubscription.unsubscribe();
  }
  }
 
  getSubscriptionsByRoute(vendorId: string) {   
    this.usersService.getBoardingPassesByRoute(vendorId).pipe(
      takeUntil(this.stopSubscription$)
    ).subscribe(data => {
      //console.log("data Result");
      //console.log(data);
      this.rowData = data;
     // this.createNestedTableData(data);
    })
  }

  getSubscriptionsByTurn(productId: string, turno: string ) {   

    
   this.usersService.getBoardingPassesByTurn(productId, turno).pipe(
      takeUntil(this.stopSubscription$)
    ).subscribe(data => {
      this.rowDataPayTurn = data;
      console.log(this.rowDataPayTurn);
      this.TotalUsers = this.sumAllPasses(this.rowDataPayTurn);
     // console.log('Total Sum of Passes:',   this.TotalUsers );
     // this.createNestedTableData(data);
    }); 
  }
 
    
  sumAllPasses(rowDataPayTurn: any[]): number {
    let totalSum = 0;  
    // Iterate through each object in the rowDataPayTurn array
    rowDataPayTurn.forEach((row) => {
      if (row && Array.isArray(row.passes)) {
        // Extract the 'passes' array from the object
        const passesArray = row.passes.length;  
        // Calculate the sum of 'passes' array
       // const passesSum = passesArray.reduce((acc, pass) => acc + pass, 0);  
        // Add the sum of 'passes' to the total
        totalSum +=  row.passes.length;
      }
    });  
    return totalSum;
  }

  sumAllCV(rowDataPayCV: any[]): number {
    let totalSum = 0;  
    // Iterate through each object in the rowDataPayCV array
    rowDataPayCV.forEach((row) => {
      if (row && Array.isArray(row.passes)) {
        // Extract the 'passes' array from the object
        row.passes.forEach((inRow) =>{
          this.amountCV =inRow.amountPayment;
          this.priceCV =inRow.amount;
          const passesArray =  this.priceCV  - this.amountCV ;  
          // Calculate the sum of 'passes' array
         // const passesSum = passesArray.reduce((acc, pass) => acc + pass, 0);  
          // Add the sum of 'passes' to the total         
          totalSum +=  passesArray;
        })
        
      }
    });     
    return totalSum;
  }

  sumAllCVByR(rowDataPayCVByR: any[]): number {
    let totalSum = 0;  
    // Iterate through each object in the rowDataPayCVByR array
    rowDataPayCVByR.forEach((row) => {
      if (row && Array.isArray(row.passes)) {
        // Extract the 'passes' array from the object
        row.passes.forEach((inRow) =>{
          this.amountCV =inRow.amountPayment;
          this.priceCV =inRow.amount;
          const passesArray =  this.priceCV  - this.amountCV ;  
          // Calculate the sum of 'passes' array
         // const passesSum = passesArray.reduce((acc, pass) => acc + pass, 0);  
          // Add the sum of 'passes' to the total         
          totalSum +=  passesArray;
        })
        
      }
    });     
    return totalSum;
  }
  

  getSubscriptions(productId: string) {   
    this.usersService.getBoardingPassesByProduct(productId).pipe(
      takeUntil(this.stopSubscription$)
    ).subscribe(data => {
      //console.log("data Result");
      //console.log(data);f
      this.rowDataPay = data;
      //this.createNestedTableData(data);
    })
  } 

  getSubscriptionsPase(productId: string) {   
    this.usersService.getBoardingPassesByProduct(productId).pipe(
      takeUntil(this.stopSubscription$)
    ).subscribe(data => {
      this.createNestedTableData(data);
    })
  }

  getSubscriptionsAnticipos(productId: string) {   
    this.usersService.getBoardingPassesByAnticipos(productId).pipe(
      takeUntil(this.stopSubscription$)
    ).subscribe(data => {
      this.createNestedTableDataA(data);
    })
  } 

  getSubscriptionsCV(productId: string) {       
    this.usersService.getBoardingPassesByCV(productId).pipe(
      takeUntil(this.stopSubscription$)
    ).subscribe(data => {   
      //console.log(data);
      this.rowDataPayCV = data;
      this.TotalMPP = this.sumAllCV(this.rowDataPayCV);
      this.createNestedTableDataCV(data);
    })   
  } 

  getSubscriptionsCVByRoute(productId: string) {
    this.usersService.getBoardingPassBySingleRoute(productId, this.routeIdSelected).pipe(
      takeUntil(this.stopSubscription$)
    ).subscribe(data => {   
      console.log(data);
      this.rowDataPayCVByR = data;
      this.TotalMPByRoute = this.sumAllCVByR(this.rowDataPayCVByR);
      this.createNestedTableDataCVByRoute(data);
    })   
  }

  createNestedTableDataA(data: any) {   
    this.usersListA = [];
    for (let i = 0; i < data.length; ++i) {
      data[i].key = i;
      data[i].expand = false;
      data[i].routeName = data[i].passes[0].routeName;
      for (let x = 0; x < data[i].passes.length; ++x) {
        data[i].passes[x].key = i;
        data[i].passes[x].customerName = data[i].customerName;
        this.usersListA.push(data[i].passes[x]);
      }
    }
    
  }
  createNestedTableDataCV(data: any) {   
    this.usersListCV = [];
    for (let i = 0; i < data.length; ++i) {
      data[i].key = i;
      data[i].expand = false;
      data[i].routeName = data[i].passes[0].routeName;
      for (let x = 0; x < data[i].passes.length; ++x) {
        data[i].passes[x].key = i;
        data[i].passes[x].customerName = data[i].customerName;
        this.usersListCV.push(data[i].passes[x]);
      }
    }
     
  }
  createNestedTableDataCVByRoute(data: any) { 
    this.usersListCVByR = [];
    for (let i = 0; i < data.length; ++i) {
      data[i].key = i;
      data[i].expand = false;
      data[i].routeName = data[i].passes[0].routeName;
      for (let x = 0; x < data[i].passes.length; ++x) {
        data[i].passes[x].key = i;
        data[i].passes[x].customerName = data[i].customerName;
        this.usersListCVByR.push(data[i].passes[x]);
      }
    }
    if ( this.usersListCVByR.length > 0) {
      this.usersListCVByRDetalle= [];
      console.log(this.usersListCVByR);
      for (const user of this.usersListCVByR) {      
        this.usersService.getUserInfo(user.uid).subscribe((data) => {
        const record = {
           displayName: data.payload.data()['displayName'],
           studentId: data.payload.data()['studentId'],
           phone: data.payload.data()['phone'],
           email: data.payload.data()['email'],
           amountPayment: user.amountPayment,
           amount: user.amount,
           promiseDate:user.promiseDate
           };           
           const recordExists = this.usersListCVByRDetalle.some(existingRecord => existingRecord.studentId === data.payload.data()['studentId']);
            if (!recordExists) {             
              this.usersListCVByRDetalle.push(record);
            }           
         });
        }
    }
     
  }

  createNestedTableData(data: any) {
    this.routesList = [];
    this.usersList = [];
    for (let i = 0; i < data.length; ++i) {
      data[i].key = i;
      data[i].expand = false;
      data[i].routeName = data[i].passes[0].routeName;
      for (let x = 0; x < data[i].passes.length; ++x) {
        data[i].passes[x].key = i;
        data[i].passes[x].customerName = data[i].customerName;
        this.usersList.push(data[i].passes[x]);
      }
    }
     this.routesList = data;
  }

  onProductSelect(selectedProductId: any) {
    // Handle the selected product here
    console.log('Selected Product ID:', selectedProductId);  
    // You can perform additional actions based on the selected product
  }
  onProductSelectByRoute(selectedProductId: any) {
    // Search the routes related!
    this.routeIdSelected = "";
    this.routes = [];  
      this.routeSubscription = this.usersService.getBoardingPassRoute(selectedProductId).pipe(
        takeUntil(this.stopSubscription$)       
      ).subscribe(routes => {        
        this.routes = routes;
        console.log( this.routes);
      });
  }
  onRouteSelectByRoute(routeID: any) {
    // Search the routes related! 
    this.routeIdSelected = routeID;   
  }
  
  submitForm() {    
    this.rowDataPay= [];
    const idProduct = this.validateForm.controls['id'].value;
    this.getSubscriptions(idProduct);
   //console.log(amount);  
  }
   submitFormTurn(){    
    this.rowDataPayTurn= [];
    this.TotalUsers = 0;
    const idProduct = this.validateFormTurn.controls['id'].value;
    const turno =  this.validateFormTurn.controls['turno'].value;
    this.getSubscriptionsByTurn(idProduct, turno);
   }
   submitFormPase(){
    this.rowDataPay= [];
    const idProduct = this.validateFormPase.controls['id'].value;
    this.getSubscriptionsPase(idProduct);
   }

   submitFormAnticipos(){
    this.usersListA= [];
    const idProduct = this.validateFormAnticipos.controls['id'].value;
    this.getSubscriptionsAnticipos(idProduct);
   }

   submitFormCV() {
    this.usersListCV= [];
    const idProduct = this.validateFormCV.controls['id'].value;   
   // console.log("Producto: " + idProduct);
    this.TotalMPP =0;
    this.getSubscriptionsCV(idProduct);
   }  
   submitFormCVByRoute() {   
    const idProduct = this.validateFormCVByRoute.controls['id'].value;     
    this.TotalMPByRoute =0;
    this.getSubscriptionsCVByRoute(idProduct);
    this.usersListCVByRDetalle =[];
    this.FusersListCVByRDetalle = [];
   
   
   } 

   onRowClicked(event: any) {
    console.log('Row clicked:', event.data.uid); // This will log the clicked row data to the console
  
    this.accountsSubscription =  this.usersService.getUserInfo(event.data.uid).subscribe((data) => {
     //console.log(data.payload.data()['customerName']); // Extract user information
    this.signupForm.reset();
     this.signupForm.controls['customerName'].setValue(data.payload.data()['customerName']);
      this.signupForm.controls['defaultRound'].setValue(data.payload.data()['defaultRound']);
      this.signupForm.controls['defaultRouteName'].setValue(data.payload.data()['defaultRouteName']);
      this.signupForm.controls['displayName'].setValue(data.payload.data()['displayName']);
      this.signupForm.controls['email'].setValue(data.payload.data()['email']);
      this.signupForm.controls['firstName'].setValue(data.payload.data()['firstName']);
      this.signupForm.controls['lastName'].setValue(data.payload.data()['lastName']);
      this.signupForm.controls['phone'].setValue(data.payload.data()['phone']);
      this.signupForm.controls['studentId'].setValue(data.payload.data()['studentId']); 
      this.isModalVisible = true;
    });
  }  

  onRowClickedCV(event: any) {
    console.log('Row clicked:', event.data.uid); // This will log the clicked row data to the console
  
    this.accountsSubscription =  this.usersService.getUserInfo(event.data.uid).subscribe((data) => {
     //console.log(data.payload.data()['customerName']); // Extract user information
    this.signupFormCV.reset();
     this.signupFormCV.controls['customerName'].setValue(data.payload.data()['customerName']);
      this.signupFormCV.controls['defaultRound'].setValue(data.payload.data()['defaultRound']);
      this.signupFormCV.controls['defaultRouteName'].setValue(data.payload.data()['defaultRouteName']);
      this.signupFormCV.controls['displayName'].setValue(data.payload.data()['displayName']);
      this.signupFormCV.controls['email'].setValue(data.payload.data()['email']);
      this.signupFormCV.controls['firstName'].setValue(data.payload.data()['firstName']);
      this.signupFormCV.controls['lastName'].setValue(data.payload.data()['lastName']);
      this.signupFormCV.controls['phone'].setValue(data.payload.data()['phone']);
      this.signupFormCV.controls['studentId'].setValue(data.payload.data()['studentId']); 
      this.isModalVisibleCV = true;
    });
  }  

  detalleCVbyR() {
    if (this.TotalMPByRoute == 0) {
      this.sendMessage('error', "Se requiere seleccionar un producto y ruta para detallar.");
    } else {
      //Show detail of the process  
    this.FusersListCVByRDetalle = this.usersListCVByRDetalle;
    }
    //this.FusersListCVByRDetalle = this.usersListCVByRDetalle;
    
  }
  
  sendMessage(type: string, message: string): void {
    this.msg.create(type, message);
  }

  handleOK() { 
    this.isModalVisible = false;
    this.isModalVisibleCV =false;
  }
  handleCancel () { // cancel.
    this.isModalVisible = false;
    this.isModalVisibleCV = false;
  }
  
}