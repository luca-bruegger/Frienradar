import { TestBed } from '@angular/core/testing';

import { RealtimeService } from './realtime.service';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../store';
import { environment } from '../../../environments/environment';
import { IonicModule } from '@ionic/angular';

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        }),
        IonicModule.forRoot()
      ]
    });
    service = TestBed.inject(RealtimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
