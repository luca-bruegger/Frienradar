import { Component, OnInit } from '@angular/core';
import { Providers } from '../../helper/providers';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit {

  accounts = Providers.data;

  constructor() { }

  ngOnInit() {
  }

  editAccountname(key) {

  }
}
