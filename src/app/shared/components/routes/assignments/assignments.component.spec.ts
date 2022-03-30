import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedCustomerVendorAssignmentsComponent } from './assignments.component';

describe('AssignmentsComponent', () => {
  let component: SharedCustomerVendorAssignmentsComponent;
  let fixture: ComponentFixture<SharedCustomerVendorAssignmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedCustomerVendorAssignmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedCustomerVendorAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
