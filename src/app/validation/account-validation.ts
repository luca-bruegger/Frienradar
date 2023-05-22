import { FormControl, FormGroup, Validators } from '@angular/forms';

export class AccountValidation {
  // --- FORM MESSAGES ---

  static formMessages = {
    email: [
      { type: 'required' },
      { type: 'pattern' }
    ],
    passwordRegister: [
      { type: 'required' },
      { type: 'minLength' },
      { type: 'maxLength' },
      { type: 'pattern' }
    ],
    passwordLogin: [
      { type: 'required' }
    ],
    name: [
      { type: 'required' },
      { type: 'minLength' },
      { type: 'maxLength' }
    ],
    description: [
      { type: 'minLength' },
      { type: 'maxLength' }
    ],
    profilePicture: [
      { type: 'required' }
    ],
    acceptTerms: [
      { type: 'required' }
    ],
    username: [
      { type: 'required' },
      { type: 'minLength' },
      { type: 'maxLength' },
      { type: 'pattern' }
    ],
  };

  static socialAccountUsernameMessages = [
    { type: 'required' },
    { type: 'minLength' },
    { type: 'maxLength' },
    { type: 'pattern' }
  ];

  // --- CONTROLS ---
  static usernameControl(disabled = false) {
    return new FormControl({
      value: '',
      disabled
    }, [
      Validators.required,
      Validators.maxLength(30),
      Validators.minLength(3),
      Validators.pattern('^\\S*$')
    ]);
  }

  static get nameControl() {
    return new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(128)
    ]);
  }

  static get acceptTermsControl() {
    return new FormControl(false, [
      Validators.requiredTrue
    ]);
  }

  static get profilePictureControl() {
    return new FormControl('', [
      Validators.required
    ]);
  }

  // --- FORM GROUPS ---

  static loginFormGroup: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(100),
      Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,})')
    ]),
    name: AccountValidation.nameControl,
    profilePicture: AccountValidation.profilePictureControl,
    acceptTerms: AccountValidation.acceptTermsControl
  });

  static editProfileFormGroup: FormGroup = new FormGroup({
    email: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
    ]),
    name: AccountValidation.nameControl,
    username: AccountValidation.usernameControl(),
    profilePicture: AccountValidation.profilePictureControl,
    description: new FormControl('', [
      Validators.minLength(2),
      Validators.maxLength(200)
    ])
  });
}
