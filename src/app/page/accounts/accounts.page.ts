import { Component, OnInit } from '@angular/core';
import { Providers } from '../../helper/providers';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit {

  accountPresets = Providers.data;
  selectedPreset = {
    key: ''
  };

  constructor() { }

  ngOnInit() {
  }

  editAccountname(key) {


  }

  addAccount(event) {
    console.log(event);
    this.selectedPreset = event;
  }

  isSelectedItem(name) {
    return this.selectedPreset.key === name;
  }
}
