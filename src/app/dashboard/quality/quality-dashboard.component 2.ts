import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CellEditingStartedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UploadChangeParam } from 'ng-zorro-antd/upload';
import { Observable, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { IFileInfo, QualityColumnDef } from 'src/app/logistics/classes';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { QualityService } from 'src/app/shared/services/quality.service';
import { RolService } from 'src/app/shared/services/roles.service';


@Component({
  templateUrl: './quality-dashboard.component.html',
  styleUrls: ['./quality-dashboard.component.css']
})
export class QualityDashboardComponent implements OnInit {
  fileUrl: string = "http://themenate.com/applicator/dist/assets/images/avatars/thumb-13.jpg";
  autosave: boolean = true;
  uploading: boolean = false;
  bucketPath: string = '/quality1/quality/';
  view: string = 'Ver';
  isVerVisible: boolean = false;
  isEditModalVisible: boolean = false;
  urlFile: string = "";
  // Upload Task 
  task: AngularFireUploadTask;
  // Progress in percentage
  uploadPercent: Observable<number>;
  getMetadata: Observable<any>;
  uploadvalue: number = 0;
  downloadURL: Observable<string>;
  // Snapshot of uploading file
  snapshot: Observable<any>;
  // Uploaded File URL
  UploadedFileURL: Observable<string>;
  fileListInfo: any;
  validateForm: FormGroup;

  rowFleetData: any[];
  columnFleetDefsProgram = QualityColumnDef;
  columnDefs = QualityColumnDef;
  gridApi: any;
  gridApiDetail: any;
  gridColumnApiDetail: any;
  rowData: IFileInfo[];
  rowFolders = [];
  qualitySubscription: Subscription;
  addNewFolder: boolean = false;
  fileURL: string;
  fileName: string;
  selectedUid: string;
  selectedRecord = [];
  public rowSelectionEdit = 'single';
  public rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' = 'always';
  infoLoad: any = [];
  userlevelAccess: string;
  user: any;

  constructor(private msg: NzMessageService,
    private bucketStorage: AngularFireStorage,
    private fb: FormBuilder,
    private rolService: RolService,
    public authService: AuthenticationService,
    private qualityService: QualityService) {
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

  ngOnInit() {

    this.validateForm = this.fb.group({
      folder: [''],
      fileUrl: [''],
      fileName: [''],
      NewFolderName: ['']
    });
    this.loadFiles();
  }
  sendMessage(type: string, message: string): void {
    this.msg.create(type, message);
  }


  loadFiles() {
    this.qualitySubscription = this.qualityService.getFiles().subscribe((files) => {
      this.rowData = files;
      if (files.length >= 0) {
        files.forEach(element => {
          this.rowFolders.push(element["folder"]);
        });
        const unique = Array.from(new Set(this.rowFolders));
        this.rowFolders = unique;
      }
    });
  }

  ngOnDestroy() {
    this.qualitySubscription.unsubscribe();
  }


  submitForm() {
    console.log("GuardarArchivo");

    var fileForm: Object;
    var fileinfoURL = this.fileURL || "";
    var folder = this.validateForm.controls['folder'].value || "";
    var fileName = this.fileName || "No-Name";
    var creation_date = new Date();
    console.log(this.fileName);
    if (folder == "") {
      this.msg.error("Se requiere seleccionar una carpeta para almacenenar.");
    }

    if (fileinfoURL == "") {
      this.msg.error("Se requiere tener un archivo para subir.");
    }

    //console.log('url==' + this.fileURL);

    fileForm = {
      active: true,
      folder: folder,
      fileUrl: fileinfoURL,
      fileName: fileName,
      creation_date: creation_date,
      uid: ''
    }
    // console.log(fileForm);
    // save info 
    if (this.userlevelAccess != "3") {
      this.qualityService.saveFileCollection(fileForm)
        .then((success) => {
          this.msg.success("Se subio el archivo con éxito.");
          this.refreshTable();

        }).catch((err) => {
          this.msg.error("Se presento un error." + err);
        });
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
    }
  }

  changeFolder(event) {
    console.log("changeFolder");
  }
  newFolder() {
    this.addNewFolder = true;
  }

  handleChange({ file, fileList }: UploadChangeParam): void { 
  }
  
  async updateURL(url) {
    this.fileURL = url;
  }

  private getBase64(img: File, callback: (img: {}) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  refreshTable() {
    this.loadFiles();
  }
  onSelectionChangedEdit(params: GridReadyEvent) {
    const selectedRows = this.gridApiDetail.getSelectedRows();
    let recordToPatchValue = { ...selectedRows[0] };
    this.isEditModalVisible = true;
    this.selectedRecord = recordToPatchValue;
    this.urlFile = recordToPatchValue.fileUrl;
    this.selectedUid = recordToPatchValue.uid;
  }

  onGridReady(params: GridReadyEvent) {
    console.log("onGridReady" + params);
    this.gridApiDetail = params.api;
    this.gridColumnApiDetail = params.columnApi;
  }

  newFolderSave() {
    this.rowFolders.push(this.validateForm.controls['NewFolderName'].value);
    this.addNewFolder = false;
    this.validateForm.controls['NewFolderName'].setValue("");
  }

  public columnProgram: ColDef = {
    resizable: true,
  };

  handleOKEdit() {
    console.log("borrararchivo." + this.view);
    console.log(this.selectedRecord);

    if (!this.isVerVisible) {
      if (this.userlevelAccess == "1") {
        this.qualityService.deletePurchase(this.selectedUid);
        this.refreshTable();
        this.isEditModalVisible = false;
      } else {
        this.sendMessage('error', "El usuario no tiene permisos para borrar datos, favor de contactar al administrador.");
      }
    } else {
      this.isVerVisible = true;
    }
  }

  changeOption(value) {
    if (value == 2) {
      this.isVerVisible = false;
    } else {
      this.isVerVisible = true;
    }

  }

  handleCancelEdit() {
    this.isEditModalVisible = false;
  }

  handleChangeUpload(info: UploadChangeParam): void {
    console.log("pasa1 : " + info.file.status);
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);

      if (info.file.status === 'done') {
        this.msg.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        this.msg.error(`${info.file.name} file upload failed.`);
      }
      this.getBase64(info.file.originFileObj, (img: string) => {
        this.fileUrl = img;

        const fileRef = this.bucketStorage.ref(this.bucketPath + info.file.name);
        // this.bucketPath +=  info.file.name;
        console.log(this.bucketPath);
        console.log("this.task");
        this.task = this.bucketStorage.ref(this.bucketPath + info.file.name).putString(img, 'data_url');
        this.fileName = info.file.name;
        // Create a reference under which you want to list
        var listRef = this.bucketStorage.ref(this.bucketPath).child(info.file.name);
        //console.log(fileRef);
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
            this.downloadURL = fileRef.getDownloadURL();
            this.downloadURL.subscribe(async (url) => {
              this.updateURL(url);
            });
          })
        ).subscribe();

      });
    }
    //console.log( this.fileURL);

  }
}