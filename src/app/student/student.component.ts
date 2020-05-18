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
	public form: FormGroup;
	public txMode = 'off';

	constructor(
		public globals: Globals,
		private modalService: ModalService,
		public portisService: PortisService
	) { }

	async ngOnInit() {
		if (!this.globals.service) {
			this.globals.service = new InfuraService();
			await this.globals.ensService.configureProvider(
				this.globals.service.provider,
				false
			);
			console.log("Connected to infura");
		}
		if (!this.globals.selectedStudent) return;
		this.globals.service
			.connectStudent()
			.then(() => this.refreshAccountInfo());
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
		this.globals.selectedStudent.address = await this.globals.service.getAddress();
		this.globals.selectedStudent.smartContractAddress = await this.globals.service.getStudentSmartContract();
		this.globals.selectedStudent.name = await this.globals.service.getStudentName();
	}


}
