import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { ModalService } from '../_modal';

import { PortisService } from '../services/portis.service';
import Web3 from 'web3';

@Component({
  selector: 'app-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.css']
})
export class ClassroomComponent implements OnInit {
  focus;
  focus1;

  public mode = 'loadingPage';
  public classrooms: Classroom[] = [];
  public form: FormGroup;

  constructor(private modalService: ModalService, private portisService: PortisService) { }

  async ngOnInit() {
    this.mode = 'loadingPage';
    const resposta = await this.portisService.initPortis();
    //const connectUniversity = await this.portisService.conectUniversity();
    //console.log(connectUniversity);
    if (resposta == true) {
      this.mode = 'connected';
    } 
    else {
      this.mode = 'unconnected';
    }
  }

  address: any;

  async conectPortis(): Promise<any> {
    this.mode = 'loadingPage';
    const resposta = await this.portisService.initPortis();
    this.address = this.portisService.getAddress();
    console.log(this.address)
    if (resposta == true) {
      this.mode = 'connected';
    } 
    else {
      this.mode = 'unconnected';
    }
  }

  openModal(id: string) {
    this.modalService.open(id);
  }
  closeModal(id: string) {
    this.modalService.close(id);
  }

}

