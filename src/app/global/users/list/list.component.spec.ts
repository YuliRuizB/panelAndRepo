import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalUsersListComponent } from './list.component';

describe('ListComponent', () => {
  let component: GlobalUsersListComponent;
  let fixture: ComponentFixture<GlobalUsersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalUsersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
