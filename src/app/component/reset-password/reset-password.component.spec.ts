import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResetPasswordComponent } from './reset-password.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../store';
import { environment } from '../../../environments/environment';
import { RouterTestingModule } from '@angular/router/testing';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordComponent ],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        }),
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
