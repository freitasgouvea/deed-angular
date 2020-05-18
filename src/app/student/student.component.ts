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
	userIsStudent = true;
	public txMode = 'off';
	name: any;
	address: any;
	studentSmartContract: any;

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
		this.refreshAccountInfo();
	}

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

	async refreshAccountInfo(): Promise<any> {
		this.address = await this.globals.service.getAddress();
		this.studentSmartContract = await this.globals.service.getStudentSmartContract();
		this.name = await this.globals.service.getStudentName();
	}


}
