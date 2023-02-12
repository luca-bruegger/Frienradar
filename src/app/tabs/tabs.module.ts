import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TabsPage } from './tabs.page';

import { TabsPageRoutingModule } from './tabs-routing.module';
import { NearbyPageModule } from '../page/nearby/nearby.module';
import { AccountsPageModule } from '../page/accounts/accounts.module';
import { RadarPageModule } from '../page/radar/radar.module';
import { FriendsPageModule } from '../page/friends/friends.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    FriendsPageModule,
    AccountsPageModule,
    NearbyPageModule,
    RadarPageModule,
  ],
  declarations: [
    TabsPage
  ],
  providers: []
})
export class TabsPageModule {}
