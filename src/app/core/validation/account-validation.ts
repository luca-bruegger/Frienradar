import { FormControl, FormGroup, Validators } from '@angular/forms';

export class AccountValidation {
  static formGroup: FormGroup = new FormGroup({
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
    name: new FormControl('', [])
  });

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
      {type: 'minLength', message: 'Name ist zu kurz.'},
      {type: 'maxLength', message: 'Name ist zu lang.'},
    ]
  };

  static setLoginValidationActive(active: boolean) {
    const nameControl = AccountValidation.formGroup.get('name')
    if (active) {
      nameControl.setValidators(AccountValidation.nameValidators);
    } else {
      nameControl.clearValidators();
    }
    nameControl.updateValueAndValidity();
  }

  static get nameValidators() {
    return [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20)
    ];
  }
}
