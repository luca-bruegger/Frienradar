import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProfilePictureSelectComponent } from './profile-picture-select.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../../store';
import { environment } from '../../../../environments/environment';

describe('ProfilePictureSelectComponent', () => {
  let component: ProfilePictureSelectComponent;
  let fixture: ComponentFixture<ProfilePictureSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilePictureSelectComponent ],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        }),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePictureSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
