import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalPrivacyComponent } from './external-privacy.component';

describe('ExternalPrivacyComponent', () => {
  let component: ExternalPrivacyComponent;
  let fixture: ComponentFixture<ExternalPrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalPrivacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
