import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/service/user.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  constructor(private userService: UserService,
              private modalController: ModalController) { }

  ngOnInit() {}

  logOut() {
    this.modalController.dismiss().then(() => this.userService.signOut());
  }
}
