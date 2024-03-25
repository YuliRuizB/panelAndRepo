import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { UsersService } from 'src/app/shared/services/users.service';
import { takeUntil, map, tap, switchMap, take } from 'rxjs/operators';
import { CustomersService } from 'src/app/customers/services/customers.service';

@Component({
  selector: 'app-shared-credentials-qrcodes',
  templateUrl: './qrcodes.component.html',
  styleUrls: ['./qrcodes.component.css']
})
export class SharedUsersCredentialsQRCodesComponent implements OnInit, OnDestroy {

  @Input() accountId: string = '';

  stopSubscription$: Subject<any> = new Subject();
  activityLogList: any = [];
  loading: boolean = true;
  userCredentials: any[] = [];

  constructor(private customersService: CustomersService, private usersService: UsersService) { }

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.stopSubscription$.next(undefined);
    this.stopSubscription$.complete();
  }

  getSubscriptions() {
    this.customersService.getAccountUsersWithCredential(this.accountId, 'user').pipe(
      takeUntil(this.stopSubscription$),
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      })),
      tap((users:any) => {
        console.log('users', users);
        
        this.userCredentials = users;
        return users;
      })
    ).subscribe();
  }

}
