import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PleaseVerifyEmailComponent } from './please-verify-email/please-verify-email.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: {
          title: 'Login'
        }
      },
      {
        path: 'signup',
        component: SignupComponent,
        data: {
          title: 'Signup'
        }
      },
      {
        path: 'verify-email',
        component: VerifyEmailComponent,
        data: {
          title: 'Verify Email'
        }
      },
      {
        path: 'please-verify-email',
        component: PleaseVerifyEmailComponent,
        data: {
          title: 'Verify Email'
        }
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: {
          title: 'Forgot Password'
        }
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule { }
