import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SettingsComponent } from './settings.component';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../../store';
import { environment } from '../../../../environments/environment';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
