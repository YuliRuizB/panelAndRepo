import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutesNewComponent } from './new.component';

describe('NewComponent', () => {
  let component: RoutesNewComponent;
  let fixture: ComponentFixture<RoutesNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoutesNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoutesNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
