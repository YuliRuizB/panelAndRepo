import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NzModalService, NzMessageService, UploadFile } from 'ng-zorro-antd';
import { map, takeWhile, debounceTime, finalize } from 'rxjs/operators';
import { IVendor } from 'src/app/shared/interfaces/vendor.type';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  objectForm: FormGroup;
  objectSubscription: Subscription;
  recordId: any;
  selectedIndex: number = 0;
  record: any = {};
  avatarUrl: string = "http://themenate.com/applicator/dist/assets/images/avatars/thumb-13.jpg";
  selectedCountry: any;
  selectedLanguage: any;
  autosave: boolean = true;
  uploading: boolean = false;
  bucketPath: string = 'vendors/';

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
  //Uploaded Image List
  images: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private vendorService: VendorService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private bucketStorage: AngularFireStorage
  ) {
  }

  ngOnInit() {
    this.objectSubscription = this.route.params.subscribe(params => {
      this.recordId = params['id']; // (+) converts string 'id' to a number
      this.selectedIndex = params['index']; // (+) converts string 'id' to a number
      console.log(params);
      this.bucketPath += this.recordId;
      console.log(this.bucketPath);
      this.getSubscriptions();
    });
    this.createForm();

    this.autoSave();
  }

  ngOnDestroy(): void {
    this.objectSubscription.unsubscribe();
    this.autosave = false;
  }

  autoSave() {
    this.objectForm.statusChanges.pipe(
      debounceTime(2000),
      takeWhile(() => this.autosave)
    ).subscribe((values) => {
      if (this.objectForm.valid) {
        this.vendorService.updateVendor(this.recordId, this.objectForm.value);
      }
    })
  }

  createForm() {
    this.objectForm = this.fb.group({
      active: ['', [Validators.required]],
      address: this.fb.group({
        street: ['', [Validators.required]],
        number: ['', [Validators.required]],
        address2: ['', [Validators.required]],
        address3: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zipcode: ['', [Validators.required]],
      }),
      name: ['', [Validators.required]],
      avatar: ['', [Validators.required]],
      deleted: ['', [Validators.required]],
      legalName: ['', [Validators.required]],
      primaryContact: ['', [Validators.required]],
      rfc: ['', [Validators.required]],
      status: ['', [Validators.required]],
      website: ['', [Validators.required]],
      primaryEmail: ['', [Validators.required]],
      primaryPhone: ['', [Validators.required]]
    })
  }

  patchForm(record: IVendor) {
     if (record.address === undefined){
      this.objectForm.patchValue({
        active: record.active,
        name: record.name,
        avatar: record.avatar,
        deleted: record.deleted,
        legalName: record.legalName,
        primaryContact: record.primaryContact,
        rfc: record.rfc,
        status: record.status,
        website: record.website,
        primaryEmail: record.primaryEmail,
        primaryPhone: record.primaryPhone
      });
     }
     else {
      this.objectForm.patchValue({
      active: record.active,
      address: {
        street: record.address.street,
        number: record.address.number,
        address2: record.address.address2,
        address3: record.address.address3,
        city: record.address.city,
        state: record.address.state,
        zipcode: record.address.zipcode,
      },
      name: record.name,
      avatar: record.avatar,
      deleted: record.deleted,
      legalName: record.legalName,
      primaryContact: record.primaryContact,
      rfc: record.rfc,
      status: record.status,
      website: record.website,
      primaryEmail: record.primaryEmail,
      primaryPhone: record.primaryPhone
    });
  }
  }

  getSubscriptions() {
    this.vendorService.getVendor(this.recordId).pipe(
      map(a => {
        const id = a.payload.id;
        const data = a.payload.data() as any;
        return { id: id, ...data }
      })
    ).subscribe((vendor: IVendor) => {
      this.record = vendor;
      this.patchForm(vendor);
    })
  }

  submitForm(): void {
    for (const i in this.objectForm.controls) {
      this.objectForm.controls[i].markAsDirty();
      this.objectForm.controls[i].updateValueAndValidity();
    }

    if(this.objectForm.valid) {
      this.vendorService.updateVendor(this.recordId, this.objectForm.value)
    } else {
      
    }
  }

  private getBase64(img: File, callback: (img: {}) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  beforeUpload = (file: File) => {
    return false;
  }

  handleChange(info: { file: UploadFile }): void {
    this.getBase64(info.file.originFileObj, (img: string) => {
      this.avatarUrl = img;
      console.log(img);
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
            this.updatePhotoURL(url);
          });
        })
      ).subscribe();

    });
  }

  async updatePhotoURL(url) {
    
    console.log("started updatePhotoURL with url: ", url);
    this.objectForm.controls['avatar'].patchValue(url);
    this.vendorService.updateVendorAvatar(this.recordId, url)
  }

}
