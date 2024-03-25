import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AssignmentsService } from 'src/app/shared/services/assignments.service';
import { takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'app-shared-vendor-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css']
})
export class SharedVendorAssignmentsComponent implements OnInit, OnDestroy {

  @Input() vendorId: string = '';
  @Input() routeId: string = '';
  @Input() routeName: string = '';
  @Input() customerName: string = '';

  loading: boolean = true;

  stopSubscription$: Subject<boolean> = new Subject();
  assignmentList: any = [];
  assignmentSubscription: Subscription;

  constructor(private assignmentsService: AssignmentsService) { }

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.stopSubscription$.next(undefined);
    this.stopSubscription$.complete();
  }

  getSubscriptions() {
    this.assignmentSubscription = this.assignmentsService.getActiveAssignmentsRoute(this.vendorId, this.routeId).pipe(
      takeUntil(this.stopSubscription$),
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe( assignments => {
      this.assignmentList = assignments;
      console.log(assignments);
      this.loading = false;
    });
  }

}
