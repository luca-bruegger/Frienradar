import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, IonRouterOutlet } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsModule } from '@ngxs/store';
import { ProfilePage } from '../../app/page/profile/profile.page';
import { AppState } from '../../app/store';
import { environment } from '../../environments/environment';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilePage],
      providers: [
        {
          provide: IonRouterOutlet,
          useValue: {
            nativeEl: ''
          }
        }
      ],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
