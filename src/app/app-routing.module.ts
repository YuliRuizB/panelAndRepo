import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { redirectUnauthorizedTo, canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';

import { FullLayoutComponent } from './layouts/full-layout/full-layout.component';
import { CommonLayoutComponent } from './layouts/common-layout/common-layout.component';
import { PageNotFoundComponent } from './shared/template/page-not-found/page-not-found.component';

import { FullLayout_ROUTES } from './shared/routes/full-layout.routes';
import { CommonLayout_ROUTES } from './shared/routes/common-layout.routes';

const redirectUnauthorizedToLogin = redirectUnauthorizedTo(['authentication/login']);
const redirectAuthorizedToHome = redirectLoggedInTo(['dashboard']);
const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'authentication/login',
        pathMatch: 'full'
    },
    {
        path: '',
        component: CommonLayoutComponent,
        ...canActivate(redirectUnauthorizedToLogin),
        children: CommonLayout_ROUTES
    },
    {
        path: '',
        component: FullLayoutComponent,
        children: FullLayout_ROUTES
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            useHash: false,
            scrollPositionRestoration: 'enabled'
        })
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {
}
