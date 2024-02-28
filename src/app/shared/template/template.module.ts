import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared.module';

import { HeaderComponent } from './header/header.component';
import { SearchComponent } from './search/search.component';
import { QuickViewComponent } from './quick-view/quick-view.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { FooterComponent } from './footer/footer.component';

import { SideNavDirective } from '../directives/side-nav.directive';
import { ThemeConstantService } from '../services/theme-constant.service';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ExternalPrivacyComponent } from './privacy/external/external-privacy.component';
import { BajaUsuarioComponent } from './bajaUsuario/bajaUsuario.component';

@NgModule({
    exports: [
        HeaderComponent,
        SearchComponent,
        QuickViewComponent,
        SideNavComponent,
        SideNavDirective,
        FooterComponent,
        TermsComponent,
        PrivacyComponent,
        BajaUsuarioComponent,
        ExternalPrivacyComponent
    ],
    imports: [
        RouterModule,
        SharedModule
    ],
    declarations: [
        HeaderComponent,
        SearchComponent,
        QuickViewComponent,
        SideNavComponent,
        SideNavDirective,
        FooterComponent,
        TermsComponent,
        PrivacyComponent,
        BajaUsuarioComponent,
        PageNotFoundComponent,
        ExternalPrivacyComponent
    ],
    entryComponents: [
        TermsComponent,
        PrivacyComponent
    ],
    providers: [
        ThemeConstantService
    ]
})

export class TemplateModule { }
