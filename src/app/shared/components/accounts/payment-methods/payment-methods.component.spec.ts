import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedAccountPaymentMethodsComponent } from './payment-methods.component';

describe('PaymentMethodsComponent', () => {
  let component: SharedAccountPaymentMethodsComponent;
  let fixture: ComponentFixture<SharedAccountPaymentMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedAccountPaymentMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedAccountPaymentMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
