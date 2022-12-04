import { Component, OnDestroy, OnInit } from '@angular/core';
import { Appwrite } from '../../helpers/appwrite';
import { interval, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { Account } from '../../store';

@Component({
  selector: 'app-backend-under-maintenance',
  templateUrl: './backend-under-maintenance.component.html',
  styleUrls: ['./backend-under-maintenance.component.scss'],
})
export class BackendUnderMaintenanceComponent implements OnInit, OnDestroy {
  subscription: Subscription;

  constructor(private store: Store) { }

  ngOnInit() {
    const source = interval(5000);
    this.subscription = source.subscribe(val => {
      Appwrite.accountProvider().getSession('current').then(data => {
        this.store.dispatch(new Account.ResetBackendUnderMaintenance());
      }).catch(e => {
        return;
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
