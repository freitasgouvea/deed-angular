import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { CLASSROOMS } from 'src/models/mock-classroom';
import { Student } from 'src/models/student.model';
import { ModalService } from '../_modal';

import { PortisService } from '../services/portis.service';
import Web3 from 'web3';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})

export class LandingComponent implements OnInit {
  focus: any;
  focus1: any;
  page = 2;
  page1 = 3;

  public mode = 'unconnected';

  @ViewChild('onLoginPlaceholder1') onLoginPlaceholder1: ElementRef;
  public form: FormGroup;
  classrooms = CLASSROOMS;
  selectedClassroom: Classroom;

  constructor(private modalService: ModalService, private portisService: PortisService) { }

  ngOnInit() {

  }

  openModal(id: string) {
    this.modalService.open(id);
  }
  closeModal(id: string) {
    this.modalService.close(id);
  }

  onSelect(classroom: Classroom): void {
    this.selectedClassroom = classroom;
  }

  clear() {
    this.form.reset();
  }

  private async conectPortis(): Promise<any> {
    this.mode = 'loadingPage';
    const resposta = await this.portisService.initPortis();
    if (resposta == true) {
      this.mode = 'connected';
    } 
    else {
      this.mode = 'unconnected';
    }
  }

  getClassrooms(id: Number) {
    const data = localStorage.getItem('classrooms');
    console.log(data)
    if (data) {
      this.classrooms = JSON.parse(data);
    } else {
      this.classrooms = [];
    }

  }

}
