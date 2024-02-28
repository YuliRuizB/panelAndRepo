import { Component } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TermsComponent } from 'src/app/shared/template/terms/terms.component';
import { PrivacyComponent } from 'src/app/shared/template/privacy/privacy.component';
import { BajaUsuarioComponent } from '../bajaUsuario/bajaUsuario.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})

export class FooterComponent {

  isVisible: false;
  isConfirmLoading: boolean;

  constructor(
    private modalService: NzModalService
  ) { }

  showModalTerms() {
    this.modalService.create({
      nzTitle: 'Términos y Condiciones de Uso',
      nzContent: TermsComponent
    });
  }

  showModalPrivacy() {
    this.modalService.create({
      nzTitle: 'Privacidad',
      nzContent: PrivacyComponent,
      nzFooter: null
    });
  }
  showModalBaja() {
    this.modalService.create({
      nzTitle: 'Baja de Usuario',
      nzContent: BajaUsuarioComponent, 
      nzFooter: null
    });
  }
}
