import { Component, OnInit } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { Observable } from "rxjs";
import { finalize, map } from "rxjs/operators";
import { AuthenticationService } from "src/app/shared/services/authentication.service";
import { RolService } from "src/app/shared/services/roles.service";
import { UsersService } from "src/app/shared/services/users.service";


@Component({
    templateUrl: './my-profile-dashboard.component.html',
    styleUrls: ['./my-profile-dashboard.component.css']
})

export class MyProfileComponent implements OnInit {
    user: any;
    userRol: string = "";
    infoLoad: any = [];
    validateForm: UntypedFormGroup;
    avatarUrl: string = "http://themenate.com/applicator/dist/assets/images/avatars/thumb-13.jpg";
    uploading: boolean = false;
    bucketPath: string = 'vendors/';
    userlevelAccess:string;
    userForm: any = [];
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

    constructor(private rolService: RolService, private fb: UntypedFormBuilder,
        private bucketStorage: AngularFireStorage,
        private userService: UsersService,
        private messageService: NzMessageService,
        public authService: AuthenticationService) {

        this.validateForm = this.fb.group({
            email: [null, [Validators.email, Validators.required]],
            firstName: [null, [Validators.required]],
            lastName: [null, [Validators.required]],
            phoneNumber: [''],
            username: [''],
            displayName: [''],
            address: [''],
            city: [''],
            postCode: [''],
            state: [''],
            emailVerified: [''],
            userRol: [''],
            customerName: [''],
            photoURL: ['']
        });


        this.authService.user.subscribe((user) => {
            this.user = user;
            if (this.user.rolId != undefined) { // get rol assigned               
                this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
                    this.infoLoad = item;
                    this.userRol = this.infoLoad.description;
                    this.userlevelAccess = this.infoLoad.optionAccessLavel;
                    this.fillInfo();
                });
            }
        });
    }

    ngOnInit() {

    }

    done(): void {
        if (this.validateForm.valid) {

            let userData = {
                displayName: this.validateForm.controls["displayName"].value,
                firstName: this.validateForm.controls["firstName"].value,
                lastName: this.validateForm.controls["lastName"].value,
                address: {
                    addressLine: this.validateForm.controls["address"].value,
                    city: this.validateForm.controls["city"].value,
                    postCode: this.validateForm.controls["postCode"].value,
                    state: this.validateForm.controls["state"].value
                },
                phoneNumber: this.validateForm.controls["phoneNumber"].value
            };
            if (this.userlevelAccess != "3") {
                this.userService.updateUserCollection(this.user.uid, userData).then(response => {
                    console.log(response);
                    this.sendMessage('success', "Se actualizó con exito!");
                }).catch(err => {
                    console.log(err);
                });
            } else {
                this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
            }
          
        }
    }

    fillInfo() {
        console.log(this.user);
        //assing value
        if (this.user) {
            this.validateForm.controls['photoURL'].setValue(this.user.photoURL);
            this.validateForm.controls['displayName'].setValue(this.user.displayName);
            this.validateForm.controls['firstName'].setValue(this.user.firstName);
            this.validateForm.controls['lastName'].setValue(this.user.lastName);
            this.validateForm.controls['username'].setValue(this.user.username);
            this.validateForm.controls['address'].setValue(this.user.address.addressLine);
            this.validateForm.controls['city'].setValue(this.user.address.city);
            this.validateForm.controls['postCode'].setValue(this.user.address.postCode);
            this.validateForm.controls['state'].setValue(this.user.address.state);
            this.validateForm.controls['phoneNumber'].setValue(this.user.phoneNumber);
            this.validateForm.controls['email'].setValue(this.user.email);
            this.validateForm.controls['emailVerified'].setValue(this.user.emailVerified);
            this.validateForm.controls['userRol'].setValue(this.userRol);
            this.validateForm.controls['customerName'].setValue(this.user.customerName);
        }
    }

    updateConfirmValidator(): void {
        /** wait for refresh value */
        Promise.resolve().then(() => this.validateForm.controls.checkPassword.updateValueAndValidity());
    }

    confirmationValidator = (control: UntypedFormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return { required: true };
        } else if (control.value !== this.validateForm.controls.password.value) {
            return { confirm: true, error: true };
        }
        return {};
    }

    beforeUpload = (file: File) => {
        return false;
    }

    private getBase64(img: File, callback: (img: {}) => void): void {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
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

    sendMessage(type: string, message: string): void {
        this.messageService.create(type, message);
    }

    async updatePhotoURL(url) {

        console.log("started updatePhotoURL with url: ", url);
        console.log(this.user.id);
        this.validateForm.controls['photoURL'].patchValue(url);
        if (this.userlevelAccess != "3") {
            this.userService.updateUserAvatar(this.user.uid, url);
        }  else
        { this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");       
        }
        
       
    }

}
