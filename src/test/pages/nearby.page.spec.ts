import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NgxsModule } from '@ngxs/store';
import { NearbyPage } from '../../app/page/nearby/nearby.page';
import { AppState } from '../../app/store';
import { environment } from '../../environments/environment';

describe('NearbyPage', () => {
  let component: NearbyPage;
  let fixture: ComponentFixture<NearbyPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NearbyPage ],
      providers: [
      ],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NearbyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
