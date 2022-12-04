import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { TabsPageModule } from './tabs/tabs.module';

import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginPageModule } from './pages/login/login.module';
import { NgxsModule } from '@ngxs/store';
import { environment } from '../environments/environment';
import { AppState } from './store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { BackendUnderMaintenanceComponent } from './component/backend-under-maintenance/backend-under-maintenance.component';

@NgModule({
  declarations: [
    AppComponent,
    BackendUnderMaintenanceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    PasswordStrengthMeterModule.forRoot(),
    TabsPageModule,
    LoginPageModule,
    NgxIntlTelInputModule,
    NgxsModule.forRoot(AppState, {
      developmentMode: !environment.production
    }),
    HttpClientModule,
    HttpClientJsonpModule,
    environment.production ? [] : NgxsReduxDevtoolsPluginModule.forRoot()
  ],
  providers: [ImagePicker,
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
/*    {
      provide: APP_INITIALIZER,
      useFactory: appConfigFactory,
      deps: [AppInitService],
      multi: true
    }*/
  ],
  bootstrap: [AppComponent],
  exports: [],
  schemas: [
  ]
})

export class AppModule {}
