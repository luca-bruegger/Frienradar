import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DistanceChangeComponent } from './distance-change.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../../store';
import { environment } from '../../../../environments/environment';

describe('DistanceChangeComponent', () => {
  let component: DistanceChangeComponent;
  let fixture: ComponentFixture<DistanceChangeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DistanceChangeComponent ],
      imports: [IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DistanceChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
