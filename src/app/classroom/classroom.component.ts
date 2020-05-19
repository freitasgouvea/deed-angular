import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { ModalService } from '../_modal';
import { Globals } from '../app.globals';

import { PortisService } from '../services/portis.service';
import { InfuraService } from '../services/infura.service';
import { ENSService } from '../services/ens.service';
import { ethers } from 'ethers';

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
		if (id == 'custom-modal-search-classroom')
			this.resetSearchClassroomModalErrorMsg();
	}

	closeNotice() {
		this.displayNotice = false;
	}

	searchClassroomModalErrorMsg = false;
	searchClassroomModalProgressMsg = false;

	resetSearchClassroomModalErrorMsg() {
		this.searchClassroomModalErrorMsg = false;
	}

	async searchForClassroomModal(address: string) {
		this.searchClassroomModalProgressMsg = true;
		await this.updateClassrooms();
		this.globals.classrooms.forEach((classroom) => {
			if (classroom.smartcontract === address) {
			this.modalService.close('custom-modal-search-classroom');
			this.globals.selectedClassroom = classroom;
			this.searchClassroomModalProgressMsg = false;
			return;
			}
		});
		const node = this.globals.ensService.getNode(address);
		const ensAddress = await this.globals.ensService.lookupNodeAddress(
			node
		);
		this.globals.classrooms.forEach((classroom) => {
			if (classroom.smartcontract === ensAddress) {
			this.modalService.close('custom-modal-search-classroom');
			this.globals.selectedClassroom = classroom;
			this.searchClassroomModalProgressMsg = false;
			return;
			}
		});
		this.searchClassroomModalProgressMsg = false;
		this.searchClassroomModalErrorMsg = true;
	}

	async updateClassrooms() {
		let classroomCount = await this.globals.service.getClassroomCount();
		if (this.globals.classrooms.length == classroomCount)
			return;
		this.globals.classlistLoaded = false;
		this.globals.classrooms = new Array<Classroom>();
		let index = 0;
		while (index < classroomCount) {
			const [
				title,
				smartcontract,
				startDate,
				finishDate,
				duration,
				price,
				minScore,
				cutPrincipal,
				cutPool,
				isOpen,
				isEmpty,
				isActive,
				isFinished,
				addressChallenge,
				owner,
			] = await this.globals.service.getClassroomInfo(index);
			const newClassroom = new Classroom(
				index,
				title,
				smartcontract,
				startDate,
				finishDate,
				duration / (60 * 60 * 24),
				price,
				minScore,
				cutPrincipal / 1e4,
				cutPool / 1e4,
				isOpen,
				isEmpty,
				isActive,
				isFinished,
				addressChallenge,
				owner
			);
			this.globals.classrooms.push(newClassroom);
			await this.refreshClassroomMetadata(newClassroom);
			index++;
		}
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
		const normalName = this.globals.selectedClassroom.title
			.toLowerCase()
			.replace(/\s/g, '');
		const node = this.globals.ensService.getSubNode(normalName);
		const hasRecord = await this.globals.ensService.hasRecord(node);
		if (!hasRecord)
			await this.teacherClaimSubnode(
				normalName,
				this.globals.address,
				this.globals.selectedClassroom.smartcontract
			);
		const nodeAddress = await this.globals.ensService.lookupNodeAddress(
			node
		);
		if (nodeAddress === this.globals.ADDR0)
			await this.globals.ensService.setAddr(
				node,
				this.globals.selectedClassroom.smartcontract
			);
	}

	async setMetadataRecord(type: string, text: string) {
		const normalName = this.globals.selectedClassroom.title
			.toLowerCase()
			.replace(/\s/g, '');
		const node = this.globals.ensService.getSubNode(normalName);
		await this.globals.ensService.setTxRecord(type, text, node);
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
		classroom.metadata.ENSName =
			normalName +
			'.' +
			this.globals.ensService.name +
			this.globals.ensService.domain;
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
		classroom.ENSHasNotice = classroom.metadata.notice.length > 0;
		classroom.metadata.keywords = await this.globals.ensService.getTxKeywordsArray(
			node
		);
	}
}
