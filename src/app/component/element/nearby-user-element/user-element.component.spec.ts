import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserElementComponent } from './user-element.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../../store';
import { environment } from '../../../../environments/environment';

describe('NearbyUserElementComponent', () => {
  let component: UserElementComponent;
  let fixture: ComponentFixture<UserElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserElementComponent ],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
