import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { CLASSROOMS } from 'src/models/mock-classroom';
import { Student } from 'src/models/student.model';
import { ModalService } from '../_modal';

import { PortisService } from '../services/portis.service';
import { InfuraService } from '../services/infura.service';
import Web3 from 'web3';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  focus: any;
  focus1: any;
  page = 2;
  page1 = 3;

  universityEtherscan = "https://" + environment.network + ".etherscan.io/address/" + environment.universityAddress;
  universityName: any;
  universityCut: any;
  universityFunds: any;
  universityBudget: any;
  universityDonations: any;
  universityRevenue: any;
  universityReturns: any;
  universityAdmin: any;

  //StudentSelfRegister
  public _name = 'any';
  address: any;

  public userIsUniversityAdmin: boolean;
  public mode = 'unconnected';
  public txMode = 'off';
  public receipt: any;
  public connectedPortis = false;
  public form: FormGroup;
  public students: Student[] = [];
  classrooms = CLASSROOMS;
  selectedClassroom: Classroom;

  constructor(
    private modalService: ModalService,
    public portisService: PortisService,
    public infuraService: InfuraService
  ) {}

  ngOnInit() {
     this.refreshUniversityInfo();
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

  txOn() {
    this.txMode= 'portisAlert';
  }

  txOff() {
    this.txMode= 'off';
  }

  clear() {
    this.form.reset();
  }

  async conectPortis(): Promise<any> {
    this.mode = 'loadingPage';
    const answer = await this.portisService.initPortis();
    this.address = await this.portisService.getAddress();
    const connectUniversity = await this.portisService.conectUniversity();
    this.mode = 'connected';
    this.connectedPortis = true;
    await this.refreshUniversityInfo();
    const adminAddress = await this.portisService.getUniversityOwner();
    this.userIsUniversityAdmin = (this.address === adminAddress);
    //TODO: Student Address and Student Smart Contract Address
    //const adminAddress = await this.portisService.getUniversityOwner();
    //this.userIsUniversityAdmin = (this.address === adminAddress);
  }

  async refreshUniversityInfo(): Promise<any> {
    const service = this.connectedPortis ? this.portisService : this.infuraService;
    this.universityName = await service.getUniversityName();
    this.universityCut = await service.getUniversityCut();
    this.universityDonations = await service.getUniversityDonations();
    this.universityFunds = await service.getUniversityFunds();
    this.universityBudget = await service.getUniversityBudget();
    this.universityRevenue = await service.getUniversityRevenue();
    this.universityReturns = await service.getUniversityReturns();
  }

  async refreshAccountInfo(): Promise<any> {
    this.address = await this.portisService.getAddress();
    //TODO: call student smart contract
  }

  async studentSelfRegister(): Promise<any> {
    this.txOn(); 
    if (this._name == '') {
      this.txMode = 'failedTX';
    } else {
      this.txMode = 'processingTX';
      const selfRegister = await this.portisService.studentSelfRegister(this._name);
      if (!selfRegister) {
        this.txMode = 'failedTX';
      } else {
        this.txMode = 'successTX';
      }
    }
  }

  getClassrooms(id: Number) {
    const data = localStorage.getItem('classrooms');
    console.log(data);
    if (data) {
      this.classrooms = JSON.parse(data);
    } else {
      this.classrooms = [];
    }
  }
}
