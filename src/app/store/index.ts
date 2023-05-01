// Inside the root 'index.ts' file of our store, eg - store/index.ts
import { GlobalState } from './global';
import { AccountState } from './account';
import { LocationState } from './location';
import { UserRelationState } from './contact';
import { SocialAccountsState } from './social-accounts';

// Still allow other modules to take what they need, eg action & selectors
export * from './account';
export * from './global';
export * from './location';
export * from './contact';
export * from './social-accounts';

// rolls up our states into one const
export const AppState = [
  AccountState,
  GlobalState,
  LocationState,
  UserRelationState,
  SocialAccountsState
];
