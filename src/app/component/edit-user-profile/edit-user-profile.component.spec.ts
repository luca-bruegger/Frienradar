import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditUserProfileComponent } from './edit-user-profile.component';
import Account from '../../model/account';
import User = Account.User;

describe('EditUserProfileElementComponent', () => {
  let component: EditUserProfileComponent;
  let fixture: ComponentFixture<EditUserProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditUserProfileComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    const user = {
      id: 1,
      name: 'John',
      email: 'mock@email.com',
      password: '123456',
      description: 'mock description',
    } as unknown as User;

    fixture = TestBed.createComponent(EditUserProfileComponent);
    component = fixture.componentInstance;
    component.user = user;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
