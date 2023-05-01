import { Injectable } from '@angular/core';
import { Action, Selector, State, Store } from '@ngxs/store';
import { ApiService } from '../../service/api.service';


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
              private apiService: ApiService) {
  }

  @Selector()
  static all(state: SocialAccountsStateModel) {
    return state.socialAccounts;
  }

  @Action(SocialAccounts.Fetch)
  async fetch({ patchState }: any) {
    console.log('fetch social accounts');
    return this.apiService.get('/social_accounts').toPromise().then((response: any) => {
      const socialAccounts = JSON.parse(response).data.map(socialAccount => socialAccount.attributes);

      patchState({
        socialAccounts
      });
    }, (err: any) => {
      console.log(err);
    });
  }
}
