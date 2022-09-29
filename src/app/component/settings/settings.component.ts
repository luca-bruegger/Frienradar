import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Store } from "@ngxs/store";
import { Account } from "../../store";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  constructor(private store: Store,
              private modalController: ModalController) { }

  ngOnInit() {}

  logOut() {
    this.modalController.dismiss().then(() => this.store.dispatch(new Account.Logout()));
  }
}
