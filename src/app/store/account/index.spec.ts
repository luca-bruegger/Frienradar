import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { Account, AccountState } from './index';

describe('AccountStore', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AccountState])]
    });

    store = TestBed.inject(Store);
  });

  it('it logs user in', () => {
    const user = {
      email: '',
      password: ''
    };

    store.dispatch(new Account.Login(user));

    // const feed = store.selectSnapshot(state => state.zoo.feed);
    // expect(feed).toBeTruthy();
  });
});
