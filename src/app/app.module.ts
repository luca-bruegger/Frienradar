import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { TabsPageModule } from './tabs/tabs.module';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginPageModule } from './page/login/login.module';
import { NgxsModule } from '@ngxs/store';
import { environment } from '../environments/environment';
import { AppState } from './store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { MenuComponent } from './component/menu/menu.component';
import { EditUserProfileComponent } from './component/edit-user-profile/edit-user-profile.component';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Interceptor } from './interceptor/http.interceptor';
import { ImageCropperModule } from 'ngx-image-cropper';
import { HammerModule } from '../../node_modules/@angular/platform-browser';
import { SettingsComponent } from './component/element/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    SettingsComponent,
    EditUserProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    PasswordStrengthMeterModule.forRoot(),
    TabsPageModule,
    LoginPageModule,
    HammerModule,
    NgxIntlTelInputModule,
    NgxsModule.forRoot(AppState, {
      developmentMode: !environment.production
    }),
    HttpClientModule,
    ImageCropperModule,
    HttpClientJsonpModule,
    environment.production ? [] : NgxsReduxDevtoolsPluginModule.forRoot()
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
