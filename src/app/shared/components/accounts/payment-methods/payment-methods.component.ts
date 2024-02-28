import { Component, OnInit, Input } from '@angular/core';
import { PaymentMethodsService } from 'src/app/shared/services/payment-methods.service';
import { Subject } from 'rxjs';
import { takeUntil, map, tap } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { RolService } from 'src/app/shared/services/roles.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-shared-account-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css']
})
export class SharedAccountPaymentMethodsComponent implements OnInit {

  @Input('accountId') accountId: string;
  loading: boolean = false;

  stopSubscription$: Subject<boolean> = new Subject();
  paymentMethodsList: any = [];
  accountPaymentMethods: any = [];
  infoLoad: any = [];
  userlevelAccess:string;
 user: any;


  constructor(
    private paymentMethodsService: PaymentMethodsService,
    private messageService: NzMessageService,
    private rolService: RolService,
      public authService: AuthenticationService,

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

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }


  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
}


  getSubscriptions() {
    this.paymentMethodsService.getAccountPaymentMethods(this.accountId).pipe(
      takeUntil(this.stopSubscription$),
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      })),
      tap(paymentMethods => {
        this.accountPaymentMethods = paymentMethods;
        if(paymentMethods.length == 0) {
          this.createDefaultPaymentMethods();
        }
        return paymentMethods;
      })
    ).subscribe(() => {
      this.loading = false;
    });
  }

  createDefaultPaymentMethods() {
    if (this.userlevelAccess != "3") {
      this.paymentMethodsService.createDefaultPaymentMethods(this.accountId);
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
    }
  }

  onChange(active: boolean, paymentMethod: any) {
    this.paymentMethodsService.toggleActiveAccountPaymentMethod(this.accountId, paymentMethod.id, active);
  }

}
