import { Component, OnInit } from '@angular/core';
import { ThemeConstantService } from '../../services/theme-constant.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { Observable } from 'rxjs';
import { User1} from 'src/app/shared/interfaces/user.type';
import { RolService } from '../../services/roles.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {

    user: any;
    userRol:string = "";
    infoLoad:any = [];

    constructor(
        private themeService: ThemeConstantService,
        private rolService: RolService, 
        public authService: AuthenticationService
    ) {
        this.authService.user.subscribe( (user) => {
            this.user = user;  
            console.log(this.user);   
            if(this.user != null){
             if( this.user.rolId != undefined) { // get rol assigned               
                this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {                    
                    this.infoLoad = item;
                    this.userRol = this.infoLoad.description;
                   });
            }
            }        
            
        });
    }

    searchVisible = false;
    quickViewVisible = false;
    isFolded: boolean;
    isExpand: boolean;

    notificationList = [
        {
            title: 'You received a new message',
            time: '8 min',
            icon: 'mail',
            color: 'ant-avatar-' + 'blue'
        },
        {
            title: 'New user registered',
            time: '7 hours',
            icon: 'user-add',
            color: 'ant-avatar-' + 'cyan'
        },
        {
            title: 'System Alert',
            time: '8 hours',
            icon: 'warning',
            color: 'ant-avatar-' + 'red'
        },
        {
            title: 'You have a new update',
            time: '2 days',
            icon: 'sync',
            color: 'ant-avatar-' + 'gold'
        }
    ];

    ngOnInit(): void {
        this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
        this.themeService.isExpandChanges.subscribe(isExpand => this.isExpand = isExpand);
    }

    toggleFold() {
        this.isFolded = !this.isFolded;
        this.themeService.toggleFold(this.isFolded);
    }

    toggleExpand() {
        this.isFolded = false;
        this.isExpand = !this.isExpand;
        this.themeService.toggleExpand(this.isExpand);
        this.themeService.toggleFold(this.isFolded);
    }

    searchToggle(): void {
        this.searchVisible = !this.searchVisible;
    }

    quickViewToggle(): void {
        this.quickViewVisible = !this.quickViewVisible;
    }
}
