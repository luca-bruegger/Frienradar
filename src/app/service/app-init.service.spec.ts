import { TestBed } from '@angular/core/testing';

import { AppInitService } from './app-init.service';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../store';
import { environment } from '../../../environments/environment';
import { IonicModule } from '@ionic/angular';


export const SOME_DESIRED_STATE = {
  animals: ['Panda']
};

describe('AppInitService', () => {
  let service: AppInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        }),
      ]
    });
    service = TestBed.inject(AppInitService);
  });

  it('does app init', () => {

  });
});
