import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddResultPageRoutingModule } from './add-result-routing.module';

import { AddResultPage } from './add-result.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddResultPageRoutingModule
  ],
  declarations: [AddResultPage]
})
export class AddResultPageModule {}
