import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { NzMessageService, UploadChangeParam } from 'ng-zorro-antd';
import { Observable, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { PromotionService } from 'src/app/shared/services/promotions.service';
import { RolService } from 'src/app/shared/services/roles.service';
import { UploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css']
})
export class PromotionsComponent implements OnInit {
  @Input() accountId: string = '';
  view: string = 'cardView';
  sub: Subscription;
  user: any;
  userlevelAccess:string;
  validateForm: UntypedFormGroup;
  infoLoad: any = [];
  programForm: UntypedFormGroup;
  programEditForm:UntypedFormGroup;
  isCreateVisible: boolean = false;
  isEditMode: boolean = false;
  currentSelectedId: string;
  currentSelected: any;
  fileListInfo: any = [];
  fileList;
  fileUrl: string = "http://themenate.com/applicator/dist/assets/images/avatars/thumb-13.jpg";
  autosave: boolean = true;
  uploading: boolean = false;
  bucketPath: string = 'promotions/';
    // Upload Task 
    task: AngularFireUploadTask;
    // Progress in percentage
    uploadPercent: Observable<number>;
    uploadvalue: number = 0;
    downloadURL: Observable<string>;
    // Snapshot of uploading file
    snapshot: Observable<any>;
    // Uploaded File URL
    UploadedFileURL: Observable<string>;
    pageSize: number = 10;
    usersList: any = [];
    columnDefs;
    rowGroupPanelShow = [];
    gridOptions: GridOptions = this.getGridOptions();
    popupParent: any
    gridApi: any;
    gridColumnApi: any;;
    promotionsList:any = [];
    showUploadList = {
      showPreviewIcon: true,
      showRemoveIcon: true,
      hidePreviewIconInNonImage: true
    };
    previewImage: string | undefined = '';
    previewVisible = false;
    isEditVisible:boolean = false;

  constructor(
    public authService: AuthenticationService,
    private rolService: RolService,   
    private bucketStorage: AngularFireStorage, 
    private messageService: NzMessageService,
    private promotionsService: PromotionService,
    private fb: UntypedFormBuilder
  ) { 
    this.authService.user.subscribe((user) => {
      this.user = user;
      if (this.user.rolId != undefined) { // get rol assigned               
          this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
              this.infoLoad = item;
              this.userlevelAccess = this.infoLoad.optionAccessLavel;                 
          });
      }
  });



  this.programEditForm = this.fb.group({
    imageUrl: [''],
    active: [''],
    uid: [''],
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: [],
    validFrom: [new Date()],
    validTo: [new Date()],
    date_created: []
  })
  this.createForm();
  }

  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };

  editPromotion(uid: any,name:string, description:string,validFrom:Date, validTo:Date){
    this.programEditForm.controls['uid'].setValue(uid);
    this.programEditForm.controls['name'].setValue(name);
    this.programEditForm.controls['description'].setValue(description);
    this.programEditForm.controls['validFrom'].setValue(validFrom);
    this.programEditForm.controls['validTo'].setValue(validTo);
    this.isEditVisible = true;
 
  }
  deletePromotiom(uid: any){
    console.log("borrar promocion " + uid);
     this.promotionsService.deletePromotion(this.accountId, uid); 
  }
  diactivePromotion(value:boolean, uid: any){
    console.log("desactivar promocion " + uid);
    this.promotionsService.deactivePromotion(uid,value,this.accountId);  
  }

  promotionSelected(data:any) {
    
  }
  createForm() {
    this.programForm = this.fb.group({
      imageUrl: [''],
      active: [''],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: [],
      validFrom: [],
      validTo: [],
      date_created: []
    })
  }
  toggleActive(data) {

  }

  ngOnInit() {  
    console.log(this.accountId);
    this.sub = this.promotionsService.getPromotionsList(this.accountId).pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    )
      .subscribe((prom) => {
       
        this.promotionsList = prom;
       // console.log("listado");
       // console.log(this.promotionsList)
      });

     
  }
  showCreateModal() {
    this.programForm.reset();
    this.isCreateVisible = true;
    this.currentSelectedId = null;
    this.currentSelected = null;
  }

  showModalDelete(data) {
    console.log(data);
   /*  if (this.userlevelAccess == "1") {
      this.routesService.deleteRouteAssignments(this.accountId, data.routeId, data.id).then(() => {
        this.isCreateVisible = false;
        this.isEditMode = false;
      })
        .catch(err => console.log(err));
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para borrar datos, favor de contactar al administrador.");
    } */
   
  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
}

  handleCancel() {
    this.isCreateVisible = false;
    this.isEditMode = false;
    this.currentSelectedId = null;
    this.isEditVisible = false;
  }

  createPromotion() {
    console.log(this.programForm.valid);

    if (this.programForm.valid) {

      var advanceForm: object;

      advanceForm = {
        active: true,    
        name: this.programForm.controls['name'].value,
        description: this.programForm.controls['description'].value, 
        validFrom: this.programForm.controls['validFrom'].value,
        validTo: this.programForm.controls['validTo'].value,
        imageUrl: this.programForm.controls['imageUrl'].value || "",
        customerId:  this.user.customerId,
        category: "",
        date_created :  this.programForm.controls['date_created'].value 
      };  

      console.log(advanceForm);
      if (this.userlevelAccess != "3") {
        this.promotionsService.savePromotion(advanceForm,this.accountId).then(() => {          
          this.messageService.success(`Todo salió bien.`, {
            nzPauseOnHover: true,
            nzDuration: 3000
          });
          this.isCreateVisible = false;
        })
      } else {
        this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
      }
    }
  }
  handleChange2({ file, fileList }: UploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    this.fileListInfo = file;
    if (status === 'done') {
      this.sendMessage('success',`${file.name} Archivo cargado satisfactoriamente.`);
    } else if (status === 'error') {
      this.sendMessage('error',`${file.name} archivo fallido, favor de validar.`);
    }

    this.getBase64(file.originFileObj, (img: string) => {
      this.fileUrl = img;
          const fileRef = this.bucketStorage.ref(this.bucketPath);

      this.task = this.bucketStorage.ref(this.bucketPath).putString(img, 'data_url');

      // observe percentage changes
      this.uploadPercent = this.task.percentageChanges();
      this.uploadPercent.pipe(
        map(a => {
          return Number((a / 100).toFixed(2));
        })
      ).subscribe((value) => {
        this.uploading = value != 0;
        this.uploadvalue = value;
      })

      // get notified when the download URL is available
      this.task.snapshotChanges().pipe(
        finalize(() => {
          this.uploading = false;
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(async (url) => {
              this.updateAdvanceURL(url);
          });
        })
      ).subscribe();
    });
  }


  private getBase64(img: File, callback: (img: {}) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  async updateAdvanceURL(url) {
    console.log("url");
    console.log(url);
    this.programForm.controls['imageUrl'].patchValue(url);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getGridOptions() {
    return {
      columnDefs: this.columnDefs,
      context: {
        thisComponent: this
      },
      rowData: null,
      rowSelection: 'single',
      pagination: true,
      paginationPageSize: this.pageSize,

      enableFilter: true,
      statusBar: {
        statusPanels: [
          { statusPanel: 'agFilteredRowCountComponent' },
          { statusPanel: 'agSelectedRowCountComponent' },
          { statusPanel: 'agAggregationComponent' }
        ]
      },
      enableRangeSelection: true
    };
  }
  setPaginationPageSize(pageSize: number = 10) {
    this.pageSize = pageSize;
    console.log(this.gridApi);
    this.gridApi.paginationSetPageSize(Number(pageSize));
  }

  editSavePromotion() {
    console.log("save");
    if (this.programEditForm.valid) {


     this.promotionsService.editPromotion( this.programEditForm.controls['uid'].value,this.accountId, this.programEditForm.controls['name'].value ,  this.programEditForm.controls['description'].value,
     this.programEditForm.controls['validFrom'].value,  this.programEditForm.controls['validTo'].value).then(() => {          
        this.messageService.success(`Todo salió bien.`, {
          nzPauseOnHover: true,
          nzDuration: 3000
        });
      }) 
      this.isEditVisible = false;
    } else {
      this.sendMessage("error", "Datos invalidos favor de validar");
    }
 
  }


}
