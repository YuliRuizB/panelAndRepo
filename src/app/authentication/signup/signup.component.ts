import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { TermsComponent } from 'src/app/shared/template/terms/terms.component';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { IStopPoint } from 'src/app/shared/interfaces/route.type';
import * as _ from 'lodash';
import { CustomersService } from 'src/app/customers/services/customers.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Component({
  templateUrl: './signup.component.html'
})

export class SignupComponent implements OnInit {

  signUpForm: FormGroup;
  isLoadingOne = false;
  stopSubscription$: Subject<any> = new Subject();
  userRoutes: any = [];
  cCollection: AngularFirestoreCollection<any>;
  customers$: Observable<any[]>;
  accountId$ = new Subject<string>();
  customerSuscription: Subscription;  
  

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private modalService: NzModalService,
    private customersService: CustomersService,
    private routesService: RoutesService,
    public authService: AuthenticationService,
    private notification: NzNotificationService
  ) {
    this.cCollection = this.afs.collection<any>('customers', ref => ref.where('active', '==', true));
  }

  ngOnInit() {
    this.signUpForm = this.fb.group({
      email: [null, [Validators.email, Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8), Validators.pattern('^[A-Za-z0-9 ]+$')]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      firstName: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      lastName: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
      userName : [''],
     // phoneNumber: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]+')]],
     phoneNumber: [''],
     defaultRoute: [''],
     defaultRouteName: [''],
     defaultRound: [''],
     round: [''],    
     customerId:[''],
     customerName: [''],
     studentId:[''],
     terms: [true],
     defaultStopId: [''],
     defaultStopName:[''],
     customer_id: [''],
     refreshToken: [''],
     token: [''],
     dateCreateUserFormat : [''],
     dateCreateUserFull: [''],
     status:['active'],
    /*  studentId: [null, [Validators.required,
      Validators.minLength(7),
      Validators.maxLength(7),
      Validators.pattern('[0-9]+')]], */
      agree: [null],
      roundTrip:[],
      turno:[],
      rolId:['54YNS3xlSLPc6UzNq2HJ'], //rol mas sencillo de ver
      photoURL:[''],
      deviceInfo: this.fb.group({
        lastDataConnectWithHour: [''],
        lastDateConnect: [''] ,
        lastDateConnectFull: [''] ,
        manufacturer: [''] ,
        model: [''] ,
        platform: ['web'] ,
        versionPlatformAppStore: [''] ,
        versionPlatformAppStoreString: [''] ,
        versionPlatformDevice: [''] ,
        platformPermisionStatus: this.fb.group({
          businesName: [''],
          id: [''],
          idDoc: ['']
        }),
        businesPlatform: this.fb.group({
          businesName: [''],
          businesType: [''],
          currentVersion: [''],
          id: [''],
          idDoc: ['']
        })
      })
    });
    
    this.customers$ = this.cCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data };
      }))
    );

  
    }


  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.signUpForm.controls) {
      this.signUpForm.controls[i].markAsDirty();
      this.signUpForm.controls[i].updateValueAndValidity();
    }

    if (this.signUpForm.valid) {
      console.log(this.signUpForm.value);
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

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
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

  onCustomerSelected(event) {
    console.log(event);

  }

  fillCustomerRouteEditUser(customerID) {
    this.routesService.getRoutes(customerID).pipe(
      takeUntil(this.stopSubscription$),
      map(actions => actions.map(a => {
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
