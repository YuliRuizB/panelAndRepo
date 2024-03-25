import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { TemplateModule } from '../shared/template/template.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PleaseVerifyEmailComponent } from './please-verify-email/please-verify-email.component';
import { preRegisterComponent } from './preRegister/preRegister.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    //TemplateModule
  ],
  declarations: [
    LoginComponent,
    SignupComponent,
    preRegisterComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    PleaseVerifyEmailComponent
  ]
})

export class AuthenticationModule { }
