import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { ModalService } from '../_modal';
import { Globals } from '../app.globals';

import { PortisService } from '../services/portis.service';
import { InfuraService } from '../services/infura.service';
import { ENSService } from '../services/ens.service';

@Component({
	selector: 'app-classroom',
	templateUrl: './classroom.component.html',
	styleUrls: ['./classroom.component.css']
})
export class ClassroomComponent implements OnInit {
	focus;
	focus1;
	public form: FormGroup;
	userIsClassroomAdmin = false;

	constructor(
		public globals: Globals,
		private modalService: ModalService,
		public portisService: PortisService,
		public infuraService: InfuraService,
	) {}

	async ngOnInit() {
		if (!this.globals.service) {
			this.globals.service = this.infuraService;
			this.globals.ensService.configureProvider(
				this.infuraService.provider,
				false
			);
			console.log("Connected to infura");
		}
		if (!this.globals.selectedClassroom) return;
		this.globals.service.connectClassroom(
			this.globals.selectedClassroom.smartcontract
		);
	}

	address: any;

	async conectPortis(): Promise<any> {
		this.globals.mode = 'loadingPage';
		const answer = await this.portisService.initPortis();
		if (!answer) {
			this.globals.mode = 'unconnected';
			return;
		}
		this.address = await this.portisService.getAddress();
		await this.portisService.connectClassroom(this.globals.selectedClassroom.smartcontract);
		this.globals.mode = 'connected';
		this.globals.service = this.portisService;
		this.globals.ensService.configureProvider(this.portisService.provider);
		const adminAddress = await this.portisService.getClassroomOwner();
		this.globals.userIsClassroomAdmin = this.address === adminAddress;
	}

	async refreshClassroomInfo() {}

	openModal(id: string) {
		this.modalService.open(id);
	}
	closeModal(id: string) {
		this.modalService.close(id);
	}
}
