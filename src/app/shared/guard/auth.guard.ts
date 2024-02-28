import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { Observable } from 'rxjs';
import { tap, map, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { User } from 'src/app/shared/interfaces/user.type';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthenticationService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let role = next.data.role as Array<string>;
    return this.auth.user.pipe(
      take(1),
      map((user: User) => _.includes(user.roles, role[0])),
      tap((hasRole) => {
        if (!hasRole) {
          console.log('Access to this area requires an different user role level. Access denied.');
          this.router.navigate([`/dashboard/${role[1]}`]);
        }
        return true;
      })
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    return this.auth.user.pipe(
      take(1),
      map((user: User) => _.includes(user.roles,"admin")),
      tap((isAdmin) => {
        if (!isAdmin) {
          console.log('Access to this area requires an different user role level. Access denied.');
          this.router.navigate(['']);
        }
        return true;
      })
    );
  }
}
