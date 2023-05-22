import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Account, AccountState, GlobalActions, SocialAccountsState } from '../../store';
import { Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import OneSignal from 'onesignal-cordova-plugin';
import { AccountValidation } from '../../validation/account-validation';
import { PermissionService } from '../../service/permission.service';
import { AppService } from '../../service/app.service';
import { Path } from '../../helper/path';
import { AccountPresets } from '../../helper/accountPresets';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-additional-login-data',
  templateUrl: './additional-login-data.component.html',
  styleUrls: ['./additional-login-data.component.scss'],
})
export class AdditionalLoginDataComponent implements OnInit {
  isLoading: boolean;

  usernameFormControl = AccountValidation.usernameControl(true);

  time = 0;
  formMessages = AccountValidation.formMessages;
  user: any = {};
  requestMailButtonDisabled = false;
  mandatoryAnimationClassEnabled = false;

  constructor(private store: Store,
              private platform: Platform,
              private router: Router,
              private route: ActivatedRoute,
              private permissionService: PermissionService,
              private appInitService: AppService,
              private translocoService: TranslocoService) {

  }

  get permissionServiceGeolocation() {
    return this.permissionService.geolocation;
  }

  get permissionServicePhoto() {
    return this.permissionService.photo;
  }

  get permissionServiceNotification() {
    return this.permissionService.notification;
  }

  get isMobile() {
    return this.appInitService.isMobile();
  }

  get primaryService() {
    return this.store.selectSnapshot(SocialAccountsState.all)[0];
  }

  back() {
    this.store.dispatch(new Account.Logout());
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

    if (this.time === 60 && !this.user.confirmed) {
      this.verifyEmail();
    }
  }

  verifyEmail() {
    this.startRequestMailButtonTimer();
    this.store.dispatch(new Account.SendVerificationEmail({email: this.user.email}));
  }


  async finishAdditionalSetup() {
    const valid = this.validateAdditionalLoginSteps();

    if (!valid) {
      return;
    }


    if (this.user.username !== this.usernameFormControl.value) {
      this.isLoading = true;
      await this.store.dispatch(new Account.Update({
        options: {
          username: this.usernameFormControl.value
        }
      })).toPromise();
      await this.appInitService.redirectAfterSignIn();
      this.isLoading = false;
    }

    await this.store.dispatch(new GlobalActions.ShowToast({
      message: this.translocoService.translate('additional-login-data.completed'),
      color: 'success'
    }));
    this.store.dispatch(new GlobalActions.Redirect({
      path: Path.default,
      forward: true,
      navigateRoot: false
    }));
  }

  handleRefresh($event: any) {
    setTimeout(async () => {
      await this.permissionService.checkPermissions(this.isMobile);
      this.store.dispatch(new Account.Fetch());
      $event.target.complete();
    }, 1000);
  }

  async requestGeolocationPermission() {
    await this.permissionService.requestGeolocation(this.isMobile);
  }

  async requestPhotoPermission() {
    await this.permissionService.requestPhoto(this.isMobile);
  }

  async requestNotificationPermissions() {
    await this.permissionService.requestNotification(this.isMobile);
  }

  async clearParams() {
    await this.router.navigate(
      ['.'],
      {relativeTo: this.route, queryParams: null}
    );
  }

  nameForService(primaryService: any) {
    return AccountPresets.set[primaryService.provider_key].name;
  }

  private readRouteParams() {
    this.route.queryParams.subscribe(async params => {
      if (params && params.confirmation_token) {

        if (this.user.confirmed) {
          await this.clearParams();
          this.store.dispatch(new GlobalActions.ShowToast({
            message: this.translocoService.translate('additional-login-data.already-confirmed'),
            color: 'success'
          }));
          return;
        }

        const token = params.confirmation_token;

        await this.clearParams();
        await this.store.dispatch(new Account.Verify({
          token
        })).toPromise();
      }
    });
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

  private animateButtons() {
    if (!this.mandatoryAnimationClassEnabled) {
      this.mandatoryAnimationClassEnabled = true;
      setTimeout(() => {
        this.mandatoryAnimationClassEnabled = false;
      }, 5000);
    }
  }

  private askForNotificationPermission() {
    OneSignal.promptForPushNotificationsWithUserResponse(response => {
    });
  }

  private validateAdditionalLoginSteps() {
    if (!this.user.confirmed) {
      this.store.dispatch(new GlobalActions.ShowToast({
        message: this.translocoService.translate('additional-login-data.confirm-to-continue'),
        color: 'danger'
      }));

      this.animateButtons();
      return false;
    }

    if (!this.permissionService.hasMandatoryPermissions(this.isMobile)) {
      this.store.dispatch(new GlobalActions.ShowToast({
        message: this.translocoService.translate('additional-login-data.activate-mandatory-permissions'),
        color: 'danger'
      }));

      this.animateButtons();
      return false;
    }

    if (this.usernameFormControl.invalid) {
      this.usernameFormControl.markAsTouched();
      return false;
    }

    if (this.isMobile) {
      this.askForNotificationPermission();
    }
    return true;
  }
}
