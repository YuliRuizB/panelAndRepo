import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {

  constructor(private modal: NzModalRef) {}

  destroyModal(): void {
    this.modal.destroy();
  }

  ngOnInit() {  }

}
