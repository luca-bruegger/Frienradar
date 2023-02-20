import { FormControl, FormGroup, Validators } from '@angular/forms';

export class AccountValidation {

  // --- CONTROLS ---
  static usernameControl(disabled = false) {
    return new FormControl({
      value: '',
      disabled
    }, [
      Validators.required,
      Validators.maxLength(30),
      Validators.minLength(4),
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
    email: new FormControl({ value: '', disabled: true}, [
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

  // --- FORM MESSAGES ---

  static formMessages = {
    email: [
      {type: 'required', message: 'Email ist notwendig.'},
      {type: 'pattern', message: 'Email ist nicht gültig.'},
    ],
    passwordRegister: [
      {type: 'required', message: 'Passwort ist notwendig.'},
      {type: 'minLength', message: 'Passwort ist zu kurz.'},
      {type: 'maxLength', message: 'Passwort ist zu lang.'},
      {type: 'pattern', message: 'Passwort muss Gross- und Kleinbuchstaben und Nummern enthalten. (min. 8 Zeichen)'},
    ],
    passwordLogin: [
      {type: 'required', message: 'Passwort ist notwendig.'},
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
    ],
    acceptTerms: [
      {type: 'required', message: 'Bitte akzeptiere die Datenschutz- und Nutzungsbedingungen.'}
    ],
    username: [
      {type: 'required', message: 'Benutzername ist notwendig.'},
      {type: 'minlength', message: 'Benutzername ist zu kurz.'},
      {type: 'maxlength', message: 'Benutzername ist zu lang.'},
      {type: 'pattern', message: 'Benutzername enthält Lücken.'},
    ],
  };
}
