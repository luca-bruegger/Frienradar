import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RadarDisplayComponent } from './radar-display.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('RadarDisplayComponent', () => {
  let component: RadarDisplayComponent;
  let fixture: ComponentFixture<RadarDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RadarDisplayComponent ],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RadarDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
