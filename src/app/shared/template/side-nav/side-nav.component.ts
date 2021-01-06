import { Component, OnInit } from '@angular/core';
import { ROUTES } from './side-nav-routes.config';
import { ThemeConstantService } from '../../services/theme-constant.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-sidenav',
    templateUrl: './side-nav.component.html'
})

export class SideNavComponent implements OnInit {

    public menuItems: any[];
    isFolded: boolean;
    isSideNavDark: boolean;
    user: any;

    constructor( private themeService: ThemeConstantService, private authService: AuthenticationService) {
        this.authService.user.subscribe( (user) => {
            this.user = user;
        });
    }

    ngOnInit(): void {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
        this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
        this.themeService.isSideNavDarkChanges.subscribe(isDark => this.isSideNavDark = isDark);
    }

    checkValidity(roles: string[]) {
        return this.hasRole(roles);
    }

    hasRole(roles: string[]): boolean {
        // console.log('roles from directive: ', roles);
        for (const role of roles) {
          // console.log('user_profile', this.user);
          if(!!this.user) {
            if (this.user.roles.includes(role)) {
              // console.log("hasRoles is false");
              return true;
            }
          } else {
            return false;
          }   
        }
        // console.log("hasRoles is true");
        return false;
      }
}
