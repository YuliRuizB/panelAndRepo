import { Component, OnInit, Input } from '@angular/core';
import { PaymentMethodsService } from 'src/app/shared/services/payment-methods.service';
import { Subject } from 'rxjs';
import { takeUntil, map, tap } from 'rxjs/operators';

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

  constructor(
    private paymentMethodsService: PaymentMethodsService
  ) { }

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
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
    this.paymentMethodsService.createDefaultPaymentMethods(this.accountId);
  }

  onChange(active: boolean, paymentMethod: any) {
    this.paymentMethodsService.toggleActiveAccountPaymentMethod(this.accountId, paymentMethod.id, active);
  }

}
