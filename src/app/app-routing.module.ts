import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingComponent } from './landing/landing.component';
import { ClassroomComponent } from './classroom/classroom.component';


const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'classroom', component: ClassroomComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
