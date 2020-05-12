import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { ModalService } from '../_modal';

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
  public classrooms: Classroom[] = [];

  constructor(private modalService: ModalService) { }

  ngOnInit() {
    this.classrooms.push(new Classroom(1, "Learn Solidity", "smartcontract", "26th May 2020", "23th July 2020", 400, true, false, false));
    this.classrooms.push(new Classroom(2, "Learn Defi", "smartcontract", "1st June 2020", "27th July 2020", 200, true, false, false));
    this.classrooms.push(new Classroom(3, "Learn Dapp", "smartcontract", "23th July 2020", "11th Aug 2020", 300, true, false, false));
  }
  openModal(id: string) {
    this.modalService.open(id);
  }
  closeModal(id: string) {
    this.modalService.close(id);
  }

  clear() {
    this.form.reset();
  }

  addClassroom() {
    // this.form.value => { title; 'Title'}
    const id = this.classrooms.length + 1;
    const title = this.form.controls['title'].value
    const smartcontract = this.form.controls['smartcontract'].value
    const finishDate = this.form.controls['finishDate'].value
    const startDate = this.form.controls['startDate'].value
    const price = this.form.controls['price'].value
    const open = true
    const close = false
    const done = false
    this.classrooms.push(new Classroom(id, title, smartcontract, startDate, finishDate, price, open, close, done));
    //this.save();
    //this.clear();
  }

  saveClassroom() {
    const data = JSON.stringify(this.classrooms);
    localStorage.setItem('classrooms', data); // remove, clear
  }

  loadClassrooms() {
    const data = localStorage.getItem('classrooms');
    if (data) {
      this.classrooms = JSON.parse(data);
    } else {
      this.classrooms = [];
    }
  }

  private async conectPortis(): Promise<any> {
    this.mode = 'loadingPage';
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

}
