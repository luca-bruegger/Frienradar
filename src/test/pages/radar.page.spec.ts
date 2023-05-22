import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxsModule } from '@ngxs/store';
import { RadarPage } from '../../app/page/radar/radar.page';
import { AppState } from '../../app/store';
import { environment } from '../../environments/environment';

describe('RadarPage', () => {
  let component: RadarPage;
  let fixture: ComponentFixture<RadarPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RadarPage ],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RadarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
