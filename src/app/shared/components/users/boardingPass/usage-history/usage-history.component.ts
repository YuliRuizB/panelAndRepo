import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { UsersService } from 'src/app/shared/services/users.service';
import { takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'app-shared-usage-history',
  templateUrl: './usage-history.component.html',
  styleUrls: ['./usage-history.component.css']
})
export class SharedUsersUsageHistoryComponent implements OnInit, OnDestroy {

  @Input() userId: string = '';
  @Input() boardingPassId: string = '';

  stopSubscription$: Subject<any> = new Subject();
  activityLogList: any = [];
  loading: boolean = true;

  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.stopSubscription$.next(undefined);
    this.stopSubscription$.complete();
  }

  getSubscriptions() {
    this.usersService.getBoardingPassActivityLog(this.userId, this.boardingPassId).pipe(
      takeUntil(this.stopSubscription$),
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe( activityLog => {
      console.log(activityLog);
      this.activityLogList = activityLog;
    })
  }

}
