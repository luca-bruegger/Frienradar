import { Models } from 'appwrite';

export namespace Account {
  export type User = Models.Account<{}> & {
    prefs: UserPrefs;
    pictureBreaker: string;
  };

  export type UserPrefs = {
    description?: string;
    distance?: 'close' | 'nearby' | 'remote' | 'farAway';
  };
}

export default Account;
