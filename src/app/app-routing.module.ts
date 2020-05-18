import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingComponent } from './landing/landing.component';
import { ClassroomComponent } from './classroom/classroom.component';
import { StudentComponent } from './student/student.component';


const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'classroom', component: ClassroomComponent },
  { path: 'student', component: StudentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
