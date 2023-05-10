import { TestBed } from '@angular/core/testing';

import { AppService } from './app.service';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../store';
import { environment } from '../../../environments/environment';
import { IonicModule } from '@ionic/angular';


export const SOME_DESIRED_STATE = {
  animals: ['Panda']
};

describe('AppInitService', () => {
  let service: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        }),
      ]
    });
    service = TestBed.inject(AppService);
  });

  it('does app init', () => {

  });
});
