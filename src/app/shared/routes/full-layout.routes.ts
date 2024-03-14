import { Routes } from '@angular/router';
import { AuthPipe, redirectLoggedInTo } from '@angular/fire/auth-guard';

export const FullLayout_ROUTES: Routes = [
    {
        path: 'authentication',
        loadChildren: () => import('../../authentication/authentication.module').then(m => m.AuthenticationModule),
        canActivate: [redirectLoggedInTo(['/dashboard'])] as AuthPipe[],
    }
];
