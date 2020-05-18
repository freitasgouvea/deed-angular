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
	styleUrls: ['./classroom.component.css'],
})
export class ClassroomComponent implements OnInit {
	focus;
	focus1;
	public form: FormGroup;
	userIsClassroomAdmin = false;
	displayNotice = true;

	constructor(
		public globals: Globals,
		private modalService: ModalService,
		public portisService: PortisService
	) {}

	openModal(id: string) {
		this.modalService.open(id);
	}
	closeModal(id: string) {
		this.modalService.close(id);
	}

	closeNotice() {
		this.displayNotice = false;
	}

	async ngOnInit() {
		if (!this.globals.service) {
			this.globals.service = new InfuraService();
			this.globals.ensService.configureProvider(
				this.globals.service.provider,
				false
			);
			console.log('Connected to infura');
		}
		if (!this.globals.selectedClassroom) return;
		this.globals.service
			.connectClassroom(this.globals.selectedClassroom.smartcontract)
			.then(() => this.refreshClassroomInfo());
	}

	public refreshClassroomInfo() {
		this.globals.service
			.getClassroomOwner()
			.then(
				(adminAddress) =>
					(this.globals.userIsClassroomAdmin =
						this.globals.address == adminAddress)
			);
		this.globals.service
			.getDAIBalance(this.globals.selectedClassroom.smartcontract)
			.then(
				(val) => (this.globals.selectedClassroom.classdata.funds = val)
			);
		this.refreshClassroomMetadata(this.globals.selectedClassroom);
	}

	async conectPortis(): Promise<any> {
		this.globals.mode = 'loadingPage';
		const answer = await this.portisService.initPortis();
		if (!answer) {
			this.globals.mode = 'unconnected';
			return;
		}
		this.globals.address = await this.portisService.getAddress();
		this.globals.service = this.portisService;
		this.globals.ensService.configureProvider(this.portisService.provider);
		if (this.globals.selectedClassroom) {
			await this.portisService.connectClassroom(
				this.globals.selectedClassroom.smartcontract
			);
			const adminAddress = await this.portisService.getClassroomOwner();
			this.globals.userIsClassroomAdmin =
				this.globals.address == adminAddress;
		}
		const isRegistered = await this.globals.service.isStudentRegistred();
		if (!isRegistered) {
			this.globals.mode = 'connected';
			return;
		} else {
			this.globals.userIsStudent = true;
			this.globals.mode = 'registered';
			return;
		}
	}

	async registerENSRecord() {
		const normalName = this.globals.selectedClassroom.title.toLowerCase().replace(/\s/g, '');
		await this.teacherClaimSubnode(normalName, this.globals.address, this.globals.selectedClassroom.smartcontract);
	}

	async teacherClaimSubnode(label, owner, classroom) {
		const node = this.globals.ensService.node;
		const normalName = label.toLowerCase().replace(/\s/g, '');
		await this.globals.service.claimSubnodeClassroom(
			node,
			normalName,
			owner,
			classroom
		);
	}

	async refreshClassroomMetadata(classroom: Classroom) {
		const normalName = classroom.title.toLowerCase().replace(/\s/g, '');
		const node = this.globals.ensService.getSubNode(normalName);
		const record = await this.globals.ensService.hasRecord(node);
		if (!record) return;
		classroom.metadata.ENSName = await this.globals.ensService.lookupAddress(
			classroom.smartcontract
		);
		classroom.metadata.email = await this.globals.ensService.getTxEmail(
			node
		);
		classroom.metadata.url = await this.globals.ensService.getTxURL(node);
		classroom.metadata.avatar = await this.globals.ensService.getTxAvatar(
			node
		);
		classroom.metadata.description = await this.globals.ensService.getTxDescription(
			node
		);
		classroom.metadata.notice = await this.globals.ensService.getTxNotice(
			node
		);
		classroom.metadata.keywords = await this.globals.ensService.getTxKeywordsArray(
			node
		);
	}
}
