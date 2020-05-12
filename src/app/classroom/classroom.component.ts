import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { ModalService } from '../_modal';

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

  constructor(private modalService: ModalService) { }

  async ngOnInit() {
    const portis = new Portis("24362e3c-2da0-445c-a0ee-b1e33da455ce", "rinkeby");
    const web3 = new Web3(portis.provider);
    await portis.provider.enable();
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] == '') {
      this.mode = 'unconnected';
    } else {
      this.mode = 'connected';
    }
  }

  openModal(id: string) {
    this.modalService.open(id);
  }
  closeModal(id: string) {
    this.modalService.close(id);
  }

}

