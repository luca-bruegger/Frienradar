import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AdditionalLoginDataComponent } from './additional-login-data.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../store';
import { environment } from '../../../environments/environment';
import { RouterTestingModule } from '@angular/router/testing';

describe('AdditionalLoginDataComponent', () => {
  let component: AdditionalLoginDataComponent;
  let fixture: ComponentFixture<AdditionalLoginDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionalLoginDataComponent ],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        }),
        RouterTestingModule
      ],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalLoginDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
