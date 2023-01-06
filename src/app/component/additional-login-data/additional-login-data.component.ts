import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account, AccountState, GlobalActions } from '../../store';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AccountValidation } from '../../core/validation/account-validation';
import { Platform } from '@ionic/angular';
import { LocalPermission, LocalPermissionState } from '../../store/local-permission';
import * as Filter from 'bad-words';
import { ActivatedRoute, Router } from '@angular/router';
import { Account as AccountModel } from '../../model/account';
import User = AccountModel.User;
import { LocationService } from '../../core/service/location.service';
import { AppInitService } from '../../core/service/app-init.service';

@Component({
  selector: 'app-additional-login-data',
  templateUrl: './additional-login-data.component.html',
  styleUrls: ['./additional-login-data.component.scss'],
})
export class AdditionalLoginDataComponent implements OnInit {
  filter = new Filter();

  geolocationPermission = this.store.selectSnapshot(LocalPermissionState.geolocation);
  photosPermission = this.store.selectSnapshot(LocalPermissionState.photo);
  notificationPermission = this.store.selectSnapshot(LocalPermissionState.notification);
  usernameSet = this.store.selectSnapshot(AccountState.username);

  isLoading: boolean;

  usernameFormControl = new FormControl({
    value: '',
    disabled: true
  }, [
    Validators.required,
    Validators.maxLength(30),
    Validators.minLength(4),
    Validators.pattern('^\\S*$'),
    this.checkForInappropriateWords()
  ]);

  time = 0;
  formMessages = AccountValidation.formMessages;
  isMobile = this.platform.is('android') || this.platform.is('ios');
  user: User = {} as User;
  requestMailButtonDisabled = false;

  private verificationData: {
    secret: any;
    userId: any;
  };

  constructor(private store: Store,
              private platform: Platform,
              private router: Router,
              private route: ActivatedRoute,
              private appInitService: AppInitService) {

  }

  ngOnInit() {
    this.store.select(AccountState.user).subscribe(user => {
      if (user) {
        this.user = user;
        this.usernameFormControl.patchValue(user.username);
        if (user.username && user.username !== '') {
          this.usernameFormControl.disable();
          return;
        }
      }

      this.usernameFormControl.enable();
    });

    this.readRouteParams();
    this.checkPermissions();
  }

  back() {
    this.store.dispatch(new Account.Logout());
  }

  checkForInappropriateWords(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isProfane = this.filter.isProfane(control.value);
      return isProfane ? {profaneLanguage: true} : null;
    };
  }

  verifyEmail() {
    this.startRequestMailButtonTimer();
    this.store.dispatch(new Account.VerifyEmail()).toPromise().then(() => {
      this.store.dispatch(new GlobalActions.ShowToast(({
        message: 'Email gesendet',
        color: 'success'
      })));
    });
  }


  finishAdditionalSetup() {
    if (!this.user.emailVerification) {
      this.store.dispatch(new GlobalActions.ShowToast({
        message: 'Bestätige deine Email Adresse zum fortfahren',
        color: 'danger'
      }));
      return;
    }

    if (this.usernameFormControl.invalid) {
      this.usernameFormControl.markAsTouched();
      return;
    }

    this.isLoading = true;
    this.store.dispatch(new Account.UpdateUsername({
      username: this.usernameFormControl.value,
      userId: this.user.$id,
      email: this.user.email
    })).toPromise().then(async () => {
      await this.appInitService.startServices();
      this.isLoading = false;
    });
  }

  handleRefresh($event: any) {
    setTimeout(() => {
      this.user = this.store.selectSnapshot(AccountState.user);
      this.store.dispatch(new LocalPermission.CheckGeolocation());
      $event.target.complete();
    }, 1000);
  }

  async requestGeolocationPermission() {
    this.store.dispatch(new LocalPermission.RequestGeolocation());
  }

  async requestPhotoPermission() {
    this.store.dispatch(new LocalPermission.RequestPhoto());
  }

  async clearParams() {
    await this.router.navigate(
      ['.'],
      {relativeTo: this.route, queryParams: null}
    );
  }

  private checkPermissions() {
    this.checkGeolocationPermission();
    this.checkPhotosPermission();
    this.checkNotificationPermission();
  }

  private checkNotificationPermission() {

  }

  private checkGeolocationPermission() {
    this.store.select(LocalPermissionState.geolocation).subscribe((geolocation) => {
      this.geolocationPermission = geolocation;
    });

    this.store.dispatch(new LocalPermission.CheckGeolocation());
  }

  private readRouteParams() {
    this.route.queryParams.subscribe(async params => {
      if (params && params.userId && params.secret && params.expire) {
        this.checkIfResetIsExpired(params.expire);
        this.verificationData = {
          userId: params.userId,
          secret: params.secret
        };

        await this.clearParams();
        await this.store.dispatch(new Account.UpdateVerification(this.verificationData));
      }
    });
  }

  private checkIfResetIsExpired(expire: string) {
    const recoveryDate = new Date(expire);
    const recoveryDateOneHourLater = new Date(recoveryDate.getTime() + 60 * 60 * 1000);
    const currentDate = new Date();

    if (recoveryDateOneHourLater.getTime() - currentDate.getTime() < 0) {
      this.store.dispatch(new Account.VerificationExpired({
        message: 'Der Link ist abgelaufen. Bitte versuche es erneut.'
      }));
      return;
    }
  }

  private startRequestMailButtonTimer() {
    this.time = 60;
    this.requestMailButtonDisabled = true;
    const interval = setInterval(() => {
      this.time -= 1;
      if (this.time === 0) {
        this.requestMailButtonDisabled = false;
        clearInterval(interval);
      }
    }, 1000);
  }

  private checkPhotosPermission() {
    this.store.select(LocalPermissionState.photo).subscribe((photo) => {
      this.photosPermission = photo;
    });

    this.store.dispatch(new LocalPermission.CheckPhoto());
  }
}
