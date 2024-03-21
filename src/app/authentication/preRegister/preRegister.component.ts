import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TermsComponent } from 'src/app/shared/template/terms/terms.component';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { IStopPoint } from 'src/app/shared/interfaces/route.type';
import * as _ from 'lodash';
import { CustomersService } from 'src/app/customers/services/customers.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Component({ 
  templateUrl: './preRegister.component.html'
})

export class preRegisterComponent implements OnInit {

  signUpForm: UntypedFormGroup;
  isLoadingOne = false;
  stopSubscription$: Subject<any> = new Subject();
  userRoutes: any = [];
  customers:any;
  accountId$ = new Subject<string>();
  customerSuscription: Subscription;
  cCollection: AngularFirestoreCollection<any>;
  

  constructor(
    private fb: UntypedFormBuilder,
    private afs: AngularFirestore,
    private modalService: NzModalService,
    private customersService: CustomersService,
    private routesService: RoutesService,
    public authService: AuthenticationService,
    private notification: NzNotificationService
  ) {
  }

  ngOnInit() {
    this.signUpForm = this.fb.group({
      email: [null, [Validators.email, Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8), Validators.pattern('^[A-Za-z0-9 ]+$')]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      firstName: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      lastName: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
     // phoneNumber: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]+')]],
     turno: [],
     phoneNumber: [],
     defaultRoute: [],
     defaultRouteName: [],
     defaultRound: [],
     round: [],
     roundTrip: [],
     customerId:[],
     customerName: [],
     studentId: [null, [Validators.required,
      Validators.minLength(7),
      Validators.maxLength(7),
      Validators.pattern('[0-9]+')]],
      status:[],
      agree: [null]
    });
 
    this.cCollection = this.afs.collection<any>('customers', ref => ref.where('active','==',true));
    this.customers = this.cCollection.snapshotChanges().pipe(
      map((actions:any) => actions.map(a => { 
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe(customers => {
      this.customers = customers;
      console.log(this.customers);
    });  
    }


  submitForm(): void {  
    for (const i in this.signUpForm.controls) {
      this.signUpForm.controls[i].markAsDirty();
      this.signUpForm.controls[i].updateValueAndValidity();
    }

    if (this.signUpForm.valid) {
    this.signUpForm.controls['status'].setValue("preRegister");
      this.isLoadingOne = true;
      this.authService.signUp(this.signUpForm.value).then( 
        (result) => {
        this.isLoadingOne = false;
      }).catch((error) =>{
        this.notification.create('error', 'Submit form error', error);
      });
    }
  }

  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.signUpForm.controls.checkPassword.updateValueAndValidity());
  }

  confirmationValidator = (control: UntypedFormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.signUpForm.controls.password.value) {
      return { confirm: true, error: true };
    }
  }


  showModalTerms() {
    this.modalService.create({
      nzTitle: 'Términos y Condiciones de Uso',
      nzContent: TermsComponent
    });
  }

  onCustomerSelected(event, customers) {
    if (event != null) {
         const recordArray = _.filter(customers, r => {
        return r.id == event;
      });
      const record = recordArray[0];
      this.signUpForm.controls['customerName'].setValue(record.name);
      this.fillCustomerRouteEditUser(record.id);
    }
  }

  fillCustomerRouteEditUser(customerID) {
    this.routesService.getRoutes(customerID).pipe(
      takeUntil(this.stopSubscription$),
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      })))
      .subscribe((routes: IStopPoint[]) => {
        this.userRoutes = routes;
      });
   }
   onRouteEditUserSelected(event, routes) { 
    if (event != null  && event != '') {
      const recordArray = _.filter(routes, r => {
        return r.routeId == event;
      });
      const record = recordArray[0];
      this.signUpForm.controls['defaultRouteName'].setValue(record.name);
    }
   }

  
   ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();

    if(this.customerSuscription) {
      this.customerSuscription.unsubscribe();
    }

   }

}
