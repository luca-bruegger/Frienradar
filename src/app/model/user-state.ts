import { User } from '@firebase/auth-types';

enum UserStatus {
  unknown,
  signedIn,
  signedOut
}

export class UserState {
  readonly status: UserStatus;
  readonly value: User | undefined | null;

  constructor(value: User | undefined | null) {
    this.status =
      value === undefined ? UserStatus.unknown :
        value === null ? UserStatus.signedOut :
          UserStatus.signedIn;
    this.value = value;
  }
}
