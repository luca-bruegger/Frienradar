import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { BackendUnderMaintenanceComponent } from './backend-under-maintenance.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../store';
import { environment } from '../../../environments/environment';

describe('BackendUnderMaintenanceComponent', () => {
  let component: BackendUnderMaintenanceComponent;
  let fixture: ComponentFixture<BackendUnderMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BackendUnderMaintenanceComponent ],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackendUnderMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
