import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { ModalService } from '../_modal';
import { Globals } from '../app.globals';

import { PortisService } from '../services/portis.service';
import { InfuraService } from '../services/infura.service';
import { ENSService } from '../services/ens.service';

@Component({
	selector: 'app-student',
	templateUrl: './student.component.html',
	styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {
	focus;
	focus1;

	public mode = 'unconnected';
	selectedClassroom: Classroom;
	public form: FormGroup;
	userIsClassroomAdmin = false;
	public txMode = 'off';


	//StudentSelfRegister
	public _name = 'any';
	address: any;

	constructor(
		public globals: Globals,
		private modalService: ModalService,
		public portisService: PortisService,
		public infuraService: InfuraService,
		public ensService: ENSService
	) { }

	async ngOnInit() {
		if (!this.globals.service) {
			this.globals.service = this.infuraService;
			this.ensService.configureProvider(
				this.infuraService.provider,
				false
			);
			console.log("Connected to infura");
		}
		if (!this.selectedClassroom) return;
		this.infuraService.connectClassroom(
			this.selectedClassroom.smartcontract
		);
	}

	//async refreshClassroomInfo() {}

	openModal(id: string) {
		this.modalService.open(id);
	}
	closeModal(id: string) {
		this.modalService.close(id);
	}

	txOn() {
		this.txMode = 'preTX';
	}

	txOff() {
		this.txMode = 'off';
	}

	async conectPortis(): Promise<any> {
		this.globals.mode = 'loadingPage';
		const answer = await this.portisService.initPortis();
		if (!answer) {
			this.globals.mode = 'unconnected';
			return;
		}
		this.address = await this.portisService.getAddress();
		const connectUniversity = await this.portisService.conectUniversity();
		this.globals.service = this.portisService;
		this.ensService.configureProvider(this.portisService.provider);
		await this.refreshAccountInfo();
		const adminAddress = await this.portisService.getUniversityOwner();
		this.globals.userIsUniversityAdmin = this.address === adminAddress;
		const isRegistered = await this.globals.service.getUniversityOwner();
		if (!isRegistered) {
			this.globals.mode = 'connected';
			return;
		} else {
			this.globals.userIsStudent = true;
			this.globals.mode = 'registered';
			return;
		}
	}

	async refreshAccountInfo(): Promise<any> {
		this.address = await this.globals.service.getAddress();
		//TODO: call student smart contract
	}

	async studentSelfRegister(): Promise<any> {
		this.txOn();
		if (this._name == '') {
			this.txMode = 'failedTX';
		} else {
			this.txMode = 'processingTX';
			const selfRegister = await this.globals.service.studentSelfRegister(
				this._name
			);
			if (!selfRegister) {
				this.txMode = 'failedTX';
			} else {
				this.txMode = 'successTX';
			}
		}
		//TODO: claim university ENS record
	}


}
