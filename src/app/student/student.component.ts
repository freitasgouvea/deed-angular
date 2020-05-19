import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { ModalService } from '../_modal';
import { Globals } from '../app.globals';

import { PortisService } from '../services/portis.service';
import { InfuraService } from '../services/infura.service';
import { ENSService } from '../services/ens.service';
import { environment } from 'src/environments/environment';

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
		public portisService: PortisService,
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

	closeStudentNotice() {
		this.globals.universityDisplayNotice = false;
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
		this.globals.selectedStudent.score = await this.globals.service.getScore();
		this.globals.selectedStudent.applications = await this.globals.service.getApplications();
		this.globals.selectedStudent.hasApplications = this.globals.selectedStudent.applications.length > 0
	}

	async updateName(newName: string): Promise<any> {
		this.txOn();
		if (newName == '') {
			this.txMode = 'failedTX';
		} else {
			this.txMode = 'processingTX';
			const updateName = await this.globals.service.studentUpdateName(
				newName
			);
			if (!updateName) {
				this.txMode = 'failedTX';
			} else {
				this.txMode = 'successTX';
			}
		}
	}

	async activeStudentENS(): Promise<any> {
		this.txOn();
		this.txMode = 'processingTX';
		const node = this.globals.ensService.node;
		const normalName = this.globals.selectedStudent.name.toLowerCase().replace(/\s/g, '');
		const studentAddress = this.globals.selectedStudent.address;
		const studentSmartcContract = this.globals.selectedStudent.smartContractAddress;
		const transaction = await this.globals.service.claimSubnodeStudent( node,
			normalName, studentAddress, studentSmartcContract
		);
		console.log(transaction);
		if (!transaction) {
			this.txMode = 'failedTX';
		} else {
			this.txMode = 'successTX';
		}
	}

	async updateENSNotice(text: string) {
		await this.globals.service.setTxRecord(this.globals.ensService.node, 'notice', text);
		await this.refreshAccountInfo();
	}

	async updateENSDescription(text: string) {
		await this.globals.service.setTxRecord(
			this.globals.ensService.node,
			'description',
			text
		);
		await this.refreshAccountInfo();
	}

}
