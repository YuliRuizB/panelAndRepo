import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedAccountEditComponent } from './edit.component';

describe('EditComponent', () => {
  let component: SharedAccountEditComponent;
  let fixture: ComponentFixture<SharedAccountEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedAccountEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedAccountEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
