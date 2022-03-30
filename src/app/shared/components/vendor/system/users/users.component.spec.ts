import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedVendorUsersListComponent } from './users.component';

describe('UsersComponent', () => {
  let component: SharedVendorUsersListComponent;
  let fixture: ComponentFixture<SharedVendorUsersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedVendorUsersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedVendorUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
