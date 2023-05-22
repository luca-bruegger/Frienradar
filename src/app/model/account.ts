import { Models } from 'appwrite';

export namespace Account {
  export type User = Models.Account<{}> & {
    prefs: UserPrefs;
    username: string;
    description: string;
  };

  export type UserPrefs = {
    distance?: 'close' | 'nearby' | 'remote' | 'farAway';
  };
}

export default Account;
