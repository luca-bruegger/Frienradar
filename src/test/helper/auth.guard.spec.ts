import { NgxsModule } from '@ngxs/store';
import { environment } from '../../environments/environment';
import { IonicModule } from '@ionic/angular';
import { AuthGuard } from '../../app/helper/auth.guard';
import { TestBed } from '@angular/core/testing';
import { AppState } from '../../app/store';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
