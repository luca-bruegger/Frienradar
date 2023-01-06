import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NearbyUserElementComponent } from './nearby-user-element.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../../store';
import { environment } from '../../../../environments/environment';

describe('NearbyUserElementComponent', () => {
  let component: NearbyUserElementComponent;
  let fixture: ComponentFixture<NearbyUserElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NearbyUserElementComponent ],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NearbyUserElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
