import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';
import { IonicModule } from '@ionic/angular';
import { AppComponent } from '../app/app.component';
import { AppInitService } from '../app/core/service/app-init.service';
import { AppState } from '../app/store';
import { environment } from '../environments/environment';

describe('AppComponent', () => {

  beforeEach(waitForAsync(() => {
    const appInitService = jasmine.createSpyObj('AppInitService', ['init']);
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule.forRoot(),
        NgxsModule.forRoot(AppState, {
          developmentMode: !environment.production
        })
      ],
      providers: [
        { provide: AppInitService, useValue: appInitService }
      ]
    }).compileComponents();
  }));

  it('initializes app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;

    await component.ngOnInit();
    expect(component.hasInitialized).toBeTruthy();
  });
});
