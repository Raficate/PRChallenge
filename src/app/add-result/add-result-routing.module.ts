import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddResultPage } from './add-result.page';

const routes: Routes = [
  {
    path: '',
    component: AddResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddResultPageRoutingModule {}
