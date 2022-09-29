import { FormControl, FormGroup, Validators } from '@angular/forms';

export class AccountValidation {

  // --- VALIDATORS ---

  static get nameValidators() {
    return [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(128)
    ];
  }

  static get profilePictureValidators() {
    return [
      Validators.required
    ];
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
      Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,30})')
    ]),
    name: new FormControl('', []),
    profilePicture: new FormControl('', [])
  });

  static editProfileFormGroup: FormGroup = new FormGroup({
    email: new FormControl({ value: '', disabled: true}, [
      Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
    ]),
    name: new FormControl('', AccountValidation.nameValidators),
    profilePicture: new FormControl('', AccountValidation.profilePictureValidators),
    description: new FormControl('', [
      Validators.minLength(2),
      Validators.maxLength(200)
    ])
  });

  // --- FORM MESSAGES ---

  static formMessages = {
    email: [
      {type: 'required', message: 'Email ist notwendig.'},
      {type: 'pattern', message: 'Email ist nicht gültig.'},
    ],
    password: [
      {type: 'required', message: 'Passwort ist notwendig.'},
      {type: 'minLength', message: 'Passwort ist zu kurz.'},
      {type: 'maxLength', message: 'Passwort ist zu lang.'},
      {type: 'pattern', message: 'Passwort muss Gross- und Kleinbuchstaben Nummern enthalten.'},
    ],
    name: [
      {type: 'required', message: 'Name ist notwendig.'},
      {type: 'minlength', message: 'Name ist zu kurz.'},
      {type: 'maxlength', message: 'Name ist zu lang.'},
    ],
    description: [
      {type: 'minlength', message: 'Beschreibung ist zu kurz.'},
      {type: 'maxlength', message: 'Beschreibung ist zu lang.'},
    ],
    profilePicture: [
      {type: 'required', message: 'Profilbild ist notwendig.'}
    ]
  };

  // --- FORM HELPERS ---

  static setLoginValidationActive(active: boolean) {
    const nameControl = AccountValidation.loginFormGroup.get('name')
    const profilePictureControl = AccountValidation.loginFormGroup.get('profilePicture')

    if (active) {
      nameControl.setValidators(AccountValidation.nameValidators);
      profilePictureControl.setValidators(AccountValidation.profilePictureValidators);
    } else {
      nameControl.clearValidators();
      profilePictureControl.clearValidators();
    }
    nameControl.updateValueAndValidity();
    profilePictureControl.updateValueAndValidity();
  }
}
