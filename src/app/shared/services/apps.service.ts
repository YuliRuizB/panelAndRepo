import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AppsService {
    constructor(private http: HttpClient) {}

    public getFileManagerJson() {
        return true;
    }
}
