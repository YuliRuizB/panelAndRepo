import { Component, OnInit, TemplateRef } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { map } from 'rxjs/operators';
import { IVendor } from 'src/app/shared/interfaces/vendor.type';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolService } from 'src/app/shared/services/roles.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  view: string = 'cardView';
  newProject: boolean = false;
  vendorList: IVendor[] = [];
  objectForm: FormGroup;
  infoLoad: any = [];
  userlevelAccess:string;
 user: any;

  constructor(private modalService: NzModalService,
    private vendorService: VendorService, 
    private messageService: NzMessageService,
    private rolService: RolService,
      public authService: AuthenticationService,
    private fb: FormBuilder) { 
      this.authService.user.subscribe((user) => {
        this.user = user;
        if (this.user.rolId != undefined) { // get rol assigned               
            this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
                this.infoLoad = item;
                this.userlevelAccess = this.infoLoad.optionAccessLavel;                 
            });
        }
    });

    }

  ngOnInit(): void {
    this.getSubscriptions();
    this.createForm();
  }
  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
}

  createForm() {
    this.objectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      legalName: ['', [Validators.required, Validators.minLength(10)]],
      primaryContact: ['', [Validators.required]],
      primaryEmail: ['', [Validators.email, Validators.required]],
      primaryPhone: ['', [Validators.required]],
      active: [false],
      deleted: [false],
      status: ['In Progress'],
      website: ['', [Validators.required]]
    });
  }

  getSubscriptions() {
    this.vendorService.getVendors().pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id: id, ...data }
      }))
    ).subscribe((vendors) => {
      console.log(vendors);
      this.vendorList = vendors;
    })
  }

  showNewProject(newProjectContent: TemplateRef<{}>) {
    const modal = this.modalService.create({
      nzTitle: 'Nuevo Cliente',
      nzContent: newProjectContent,
      nzFooter: [
        {
          label: 'Crear Cliente',
          type: 'primary',
          disabled: () => {
            return !this.objectForm.valid;
          },
          onClick: () => this.modalService.confirm(
            {
              nzTitle: '¿Está seguro de crearlo?',
              nzOnOk: () => {
                this.modalService.closeAll();
                this.submitForm();
              }
            }
          )
        },
      ],
      nzWidth: 800
    })
  }

  modalConfirmDelete(objectId: string) {
    this.modalService.confirm(
      {
        nzTitle: '¿Está seguro de eliminarlo?',
        nzOnOk: () => {
          this.modalService.closeAll();
          this.vendorService.deleteVendor(objectId);
        }
      }
    )
  }

  submitForm() {
    if(this.objectForm.valid) {
      if (this.userlevelAccess != "3") {
        this.vendorService.createVendor(this.objectForm.value);
      } else {
        this.sendMessage('error', "El usuario no tiene permisos para crear datos, favor de contactar al administrador.");
      }
      
    
    }
  }

}
