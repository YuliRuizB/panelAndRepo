import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedSystemUsersListComponent } from './users.component';

describe('UsersComponent', () => {
  let component: SharedSystemUsersListComponent;
  let fixture: ComponentFixture<SharedSystemUsersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedSystemUsersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedSystemUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
