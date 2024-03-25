import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { CustomersService } from 'src/app/customers/services/customers.service';
import { IStopPoint } from 'src/app/shared/interfaces/route.type';
import { RoutesService } from 'src/app/shared/services/routes.service';
import * as _ from 'lodash';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { forkJoin } from 'rxjs';
import { UsersService } from 'src/app/shared/services/users.service';

@Component({
  selector: 'app-organigrama',
  templateUrl: './organigrama.component.html',
  styleUrls: ['./organigrama.component.css']
})
export class OrganigramaComponent implements OnInit {
  customers:any = [];
  cCollection: AngularFirestoreCollection<any>;
  usersCollection: AngularFirestoreCollection<any>;
  accountId$ = new Subject<string>();
  routeId$ = new Subject<string>();
  validateForm: UntypedFormGroup;
  validateFormP: UntypedFormGroup;
  stopSubscription$: Subject<any> = new Subject();
  routes: any ;
  routesP : any;
  rowDataPay: any = [];
  rowData: any =[];
  defaultColDef;
  columnDefsPagos;
  columnDefsPagosGenerados;
  gridApi;
  gridColumnApi;
  users: any;
  customerSubscription: Subscription;
  userSubscription: Subscription;
  userRoute: boolean = false;
  userRouteP: boolean= false;
  submitPayment: boolean = true;
contenedores:string = "";
contenedoresPay:string = "";
rowDataPre: any = [];
rowDataPush: any  = [];


  constructor( private afs: AngularFirestore,
    private usersService: UsersService, 
    private routesService: RoutesService,
    private fb: UntypedFormBuilder,
    private customersService: CustomersService) { 
     
      this.defaultColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,       
        resizable: true,
       };
      this.columnDefsPagos = [         
        { headerName: 'Turno', field: 'turno', enableRowGroup: true ,cellRenderer: (params) => {  
          const statusText = params.data.turno;
          if (statusText == 1) {
            return 'Matutino'} 
            else if(statusText == 2) { 
              return'Vespertino'} if(statusText == 3) { return 'Nocturno' }
              else {
                return "No Definido"
              } 
          return statusText;
        }},
     //   { headerName: 'Estación', sortable: true, field: 'routeName' },
        { headerName: 'Tipo de Viaje', sortable: true, field: 'roundTrip', enableRowGroup: true },
        { headerName: 'Nombre', sortable: true, field: 'displayName' },
        { headerName: 'Matrícula', sortable: true, field: 'studentId' },
        { headerName: 'Teléfono', sortable: true, field: 'phoneNumber' },
        { headerName: 'Correo', sortable: true, field: 'email' },
        { headerName: 'Status', sortable: true, field: 'status'}
      ];


    this.columnDefsPagosGenerados  = [
      //    {   headerName: 'Empresa', field: 'customerName'   },
        //  { headerName: 'Ruta', sortable: true, field: 'defaultRoute' },        
        { headerName: 'Turno', field: 'turno', enableRowGroup: true ,cellRenderer: (params) => {  
          const statusText = params.data.defaultRound;         
          return statusText;
        }},
       //   { headerName: 'Estación', sortable: true, field: 'routeName' },
          { headerName: 'Tipo de Viaje', sortable: true, field: 'roundTrip', enableRowGroup: true },
          { headerName: 'Nombre', sortable: true, field: 'displayName' },
          { headerName: 'Matrícula', sortable: true, field: 'studentId' },
          { headerName: 'Teléfono', sortable: true, field: 'phoneNumber' },
          { headerName: 'Correo', sortable: true, field: 'email' },
        ];
      

  }

  ngOnInit() {
  
      this.validateForm = this.fb.group({       
        customerId: ['', [Validators.required]],   
        customerName: [],  
        routeId: ['', [Validators.required]],
        routeName: ['', [Validators.required]],
        round: ['', [Validators.required]]       
      });

      this.validateFormP = this.fb.group({       
        customerId: ['', [Validators.required]], 
        customerName: [],      
        routeId: ['', [Validators.required]],
        routeName: ['', [Validators.required]],
        round: ['', [Validators.required]]       
      });

      
    this.cCollection = this.afs.collection<any>('customers', ref => ref.where('active','==',true));
    this.customerSubscription  = this.cCollection.snapshotChanges().pipe(
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe(customers => {
      this.customers = customers;      
    });
  }
  
  onCustomerSelectedC(event, customers) {   
    if (event != null && !this.userRoute) {
      this.userRoute = true;      
      this.routes = [];
      this.contenedores= "";
      this.rowDataPay = [];   
      const recordArray = _.filter(customers, r => {
        return r.id == event;
      });      
      const record = recordArray[0];          
      
      this.validateForm.controls['customerName'].setValue(record.name);    
      this.validateForm.controls['customerId'].setValue(record.id);        
      this.fillCustomerRoute(record.id); 
    }

  }
  onCustomerSelectedP(event, customers) {    
    if (event != null && !this.userRouteP) {
      this.userRouteP = true;
      this.routesP = [];
      this.contenedoresPay= "";  
      this.rowDataPre = [];   
      this.rowData = []; 
      const recordArray = _.filter(customers, r => {
        return r.id == event;
      });
      const record = recordArray[0];

      this.validateFormP.controls['customerName'].setValue(record.name);
      this.validateFormP.controls['customerId'].setValue(record.id);    
       this.fillCustomerRouteP(record.id);     
    }

  }

  ngOnDestroy() {
    this.stopSubscription$.next(undefined);
    this.stopSubscription$.complete();
  }

  fillCustomerRoute(customerID) {   
    this.routesService.getRoutes(customerID).pipe(
      takeUntil(this.stopSubscription$),
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      })))
      .subscribe((routes: IStopPoint[]) => {
        this.routes = routes;       
      });
  }

  fillCustomerRouteP(customerID) {   
    this.routesService.getRoutes(customerID).pipe(
      takeUntil(this.stopSubscription$),
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      })))
      .subscribe((routes: IStopPoint[]) => {
        this.routesP = routes;       
      });
  }


  onRouteSelected(event, routes) {   
    this.routeId$.next(event);
    const recordArray = _.filter(routes, r => {
      return r.routeId == event;
    });
    const record = recordArray[0];   
    this.validateForm.controls['routeName'].setValue(record.name);

  }
  onRouteSelectedP(event, routesP) {   
    this.routeId$.next(event);
    const recordArray = _.filter(routesP, r => {
      return r.routeId == event;
    });
    const record = recordArray[0];   
    this.validateFormP.controls['routeName'].setValue(record.name);

  }

  submitFormUnPaid(): void {
    this.userRoute = false;      
    this.rowDataPay= [];
    const customerID = this.validateForm.controls['customerId'].value;
    const routeID = this.validateForm.controls['routeId'].value;  
    const round = this.validateForm.controls['round'].value;
    let defaultRoundValue = "";
    if (round == 1) {
      defaultRoundValue = "Día";
    } else if(round == 2) {
      defaultRoundValue = "Tarde";
    } else {
      defaultRoundValue = "Nocturno";
    }       
    this.usersCollection = this.afs.collection<any>('users', ref => 
      ref.where('status', '==', 'preRegister')
      .where('customerId', '==', customerID)
     .where('turno','==', round)
      .where('defaultRoute','==',routeID)
      .orderBy('displayName'));    
    this.userSubscription = this.usersCollection.snapshotChanges().pipe(
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe(users => {     
      this.loadUsers(users);
    });
  }

  loadUsers(users:any){   
    this.rowDataPay =users;  
     if (users.length <= 14) {
      this.contenedores = this.organigrama(users.length,13,19,40);
    } else { if (users.length <= 19) {
      this.contenedores = this.organigrama(users.length,14,17,40);
    } else {
      this.contenedores = this.organigrama(users.length,14,19,40);
    }
    }   
  }

  loadUsersP(user:any){   
    this.contenedoresPay= "";    
    this.rowData = user;
     if (this.rowData.length <= 14) {
      this.contenedoresPay = this.organigrama(this.rowData.length,13,19,40);
    } else { if (this.rowData.length <= 19) {
      this.contenedoresPay = this.organigrama(this.rowData.length,14,17,40);
    } else {
      this.contenedoresPay = this.organigrama(this.rowData.length,14,19,40);
    }
    }   
  }

  onRoundSelected(): void {      
    if (this.submitPayment){
    
    this.submitPayment= false;
    this.userRouteP = false;      
    this.rowData= [];
    this.rowDataPre = [];
    const customerID = this.validateFormP.controls['customerId'].value;
    const routeID = this.validateFormP.controls['routeId'].value;     
    const round = parseInt(this.validateFormP.controls['round'].value, 10);
    let defaultRoundValue = "";
    if (round == 1) {
      defaultRoundValue = "Día";
    } else if(round == 2) {
      defaultRoundValue = "Tarde";
    } else {
      defaultRoundValue = "Nocturno";
    }    

    this.usersCollection = this.afs.collection<any>('users', ref => 
      ref.where('customerId', '==', customerID)
     .where('defaultRound','==', defaultRoundValue)
     .where('defaultRoute','==',routeID).orderBy('displayName')
    );    
    this.userSubscription = this.usersCollection.snapshotChanges().pipe(
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe(users => {   
      this.rowData = users;     
      this.load();
    }); 
    }
  }
 load(){
  if (this.rowData.length >= 1) {
    this.rowDataPush =[];
    this.rowData.forEach(user => {
      const userId = user.id;
         this.afs.collection(`users/${userId}/boardingPasses`, ref =>
        ref.where('active', '==', true).limit(1) // Limita a 1 documento para eficiencia
        ).get().subscribe(boardingPassessDetailSnapshot => {            
          if (!boardingPassessDetailSnapshot.empty) {
            // El usuario tiene una subcolección 'boardingPassessDetail' con al menos un documento 'active' = true
            // Realiza la acción necesaria aquí (puede ser agregar a otra lista, etc.)
            console.log(`El usuario con ID ${userId} tiene un boardingPassessDetail activo.`);
            this.rowDataPush.push({...user});             
          }
      });      
    });     
  }else {     
    this.contenedoresPay = "No existen coincidencias!";
  }
 }
  submitFormPaid() {   
    this.submitPayment= true;
    this.rowDataPre = this.rowDataPush;
    this.loadUsersP(this.rowDataPre);

  }
 onFirstDataRendered(params) {
    setTimeout(function () {
     // params.api.getDisplayedRowAtIndex(1).setExpanded(false);
    }, 0);
  } 

  organigrama(numero: number, c1:number,c2:number,c3:number) {
    let contenedor13 = 0;
  let contenedor17 = 0;
  let contenedor36 = 0;
  let sobrante = 0;
  let contenedorinicial:boolean = false;

  while (numero > 0) {
    if (numero >= c3) {
      contenedor36++;
      numero -= c3;
    } else if (numero >= c2) {
      contenedor17++;
      numero -= c2;
    } else if (numero >= c1) {
      contenedor13++;
      numero -= c1;
    } else {
      sobrante = numero;
      break; // Salir del bucle ya que no se puede almacenar más en contenedores
    }
  }
  
  let contenedor = '';

  if (contenedor13 > 0) {
    contenedor += `${contenedor13} camiones de 14 pasajeros, `;
    contenedorinicial = true;
  }

  if (contenedor17 > 0) {
    contenedor += `${contenedor17} camiones de 19 pasajeros, `;
    contenedorinicial = true;
  }

  if (contenedor36 > 0) {
    contenedor += `${contenedor36} camiones de 40 pasajeros, `;
    contenedorinicial = true;
  }

  if (sobrante > 0) {
    contenedor += `y restan ${sobrante} pasajeros sin asignacion, `;
  }

  if (contenedor !== '') {
    if(!contenedorinicial) {
      contenedor = `Se necesitan 0 camiones  ${contenedor} en total.`;
    } else{
      contenedor = `Se necesitan ${contenedor} en total.`;
    }
    
  } else {
    contenedor = 'No se necesitan camiones.';
  }
  return contenedor;
}

}

