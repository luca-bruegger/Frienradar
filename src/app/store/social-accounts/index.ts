import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { ApiService } from '../../service/api.service';
import { GlobalActions } from '../global';
import { ModalController, NavController } from '@ionic/angular';


/* State Model */
@Injectable()
export class SocialAccountsStateModel {
  socialAccounts: any[];
}

export namespace SocialAccounts {
  /** Actions */

  export class Fetch {
    static readonly type = '[SocialAccounts] Fetch';

  }

  export class Delete {
    static readonly type = '[SocialAccounts] Delete';

    constructor(public payload: { id: string }) {
    }
  }

  export class Add {
    static readonly type = '[SocialAccounts] Add';

    constructor(public payload: { providerKey: string; username: string; withRedirect: boolean }) {
    }
  }

  export class Update {
    static readonly type = '[SocialAccounts] Update';

    constructor(public payload: { id: string; username: string }) {
    }
  }
}

@State<SocialAccountsStateModel>({
  name: 'socialAccounts',
  defaults: {
    socialAccounts: []
  }
})

@Injectable()
export class SocialAccountsState {
  constructor(private store: Store,
              private apiService: ApiService,
              private navController: NavController,
              private modalController: ModalController) {
  }

  @Selector()
  static all(state: SocialAccountsStateModel) {
    return state.socialAccounts;
  }

  @Selector()
  static count(state: SocialAccountsStateModel) {
    return state.socialAccounts.length;
  }

  @Action(SocialAccounts.Fetch)
  async fetch({patchState}: any) {
    return this.apiService.get('/social_accounts').toPromise().then((response: any) => {
      const socialAccounts = JSON.parse(response).data.map(socialAccount => socialAccount.attributes);
      patchState({
        socialAccounts
      });
    }, (err: any) => {
      console.log(err);
    });
  }

  @Action(SocialAccounts.Delete)
  async deleteSocialAccount(
    {patchState, dispatch}: StateContext<SocialAccountsStateModel>,
    action: SocialAccounts.Delete
  ) {
    const {id} = action.payload;
    return this.apiService.delete('/social_accounts/' + id,).toPromise().then((response: any) => {
      patchState({
        socialAccounts: [...this.store.selectSnapshot(SocialAccountsState.all).filter((socialAccount: any) => socialAccount.id !== id)]
      });
    }, (err: any) => {
      dispatch(new GlobalActions.HandleError({
        error: err
      }));
    });
  }

  @Action(SocialAccounts.Add)
  async addSocialAccount(
    {patchState, dispatch}: StateContext<SocialAccountsStateModel>,
    action: SocialAccounts.Add
  ) {
    const {providerKey, username, withRedirect} = action.payload;
    return this.apiService.post('/social_accounts',
      {
        social_account:
          {
            provider: providerKey,
            username
          }
      }
    ).toPromise().then(async (response: any) => {
      patchState({
        socialAccounts: [...this.store.selectSnapshot(SocialAccountsState.all), response.body.data]
      });

      dispatch(new GlobalActions.ShowToast({
        message: 'Account wurde erfolgreich hinzugefügt.',
        color: 'success'
      }));

      if (!withRedirect) {
        const modal = await this.modalController.getTop();
        if (modal) {
          await modal.dismiss();
        }
        return;
      }

      await this.navController.navigateBack('/tabs/social-accounts');
    }, (err: any) => {
      dispatch(new GlobalActions.HandleError({
        error: err
      }));
    });
  }

  @Action(SocialAccounts.Update)
  async updateSocialAccount(
    {patchState, dispatch}: StateContext<SocialAccountsStateModel>,
    action: SocialAccounts.Update
  ) {
    const {id, username} = action.payload;
    return this.apiService.put('/social_accounts/' + id,
      {
        social_account:
          {
            username
          }
      }
    ).toPromise().then((response: any) => {
      patchState({
        socialAccounts: [...this.store.selectSnapshot(SocialAccountsState.all).map((socialAccount: any) => {
          if (socialAccount.id === id) {
            return response.data;
          } else {
            return socialAccount;
          }
        })]
      });

      dispatch(new GlobalActions.ShowToast({
        message: 'Account wurde erfolgreich aktualisiert.',
        color: 'success'
      }));
    }, (err: any) => {
      dispatch(new GlobalActions.HandleError({
        error: err
      }));
    });
  }
}
