import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { UsersService } from 'src/app/shared/services/users.service';
import { takeUntil, map, tap, switchMap, take } from 'rxjs/operators';
import { CustomersService } from 'src/app/customers/services/customers.service';

@Component({
  selector: 'app-shared-qrcodes',
  templateUrl: './qrcodes.component.html',
  styleUrls: ['./qrcodes.component.css']
})
export class SharedUsersQRCodesComponent implements OnInit, OnDestroy {

  @Input() accountId: string = '';

  stopSubscription$: Subject<any> = new Subject();
  activityLogList: any = [];
  loading: boolean = true;
  userBoardingPass: any[] = [];

  constructor(private customersService: CustomersService, private usersService: UsersService) { }

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }

  getSubscriptions() {
    this.customersService.getAccountSystemUsers(this.accountId, 'user').pipe(
      takeUntil(this.stopSubscription$),
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      })),
      tap(users => {
        this.getLatestValidBoardingPass(users);
        return users;
      })
    ).subscribe();
  }

  getLatestValidBoardingPass(users: any) {
    this.userBoardingPass = [];
    users.forEach(user => {
      return this.usersService.getLastValidBoardingPass(user.id).pipe(
        tap((boardingPasses:any) => {
          // console.log({ user: user, boardingPass: boardingPasses[0] || {} });
          this.userBoardingPass.push({ user: user, boardingPass: boardingPasses[0] });
          return boardingPasses;
        })
      ).subscribe();
    })
  }

}
