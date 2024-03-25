import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './shared/services/authentication.service';
import { filter, take } from 'rxjs/operators';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{

    constructor( public auth: AuthenticationService) { }

  ngOnInit() { 
    console.log("TODO 1");
    this.auth.user.pipe(
    take(1)) // take first real user
    .subscribe(user => {
      if (user) {
        console.log(user);
      } else
      {
        console.log("no user");
      }
    })  
  }

}
