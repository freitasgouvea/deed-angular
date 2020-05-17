import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { GenericUser } from 'src/models/genericUser.model';
import { CLASSROOMS } from 'src/models/mock-classroom';
import { Student } from 'src/models/student.model';
import { ModalService } from '../_modal';

import { PortisService } from '../services/portis.service';
import { InfuraService } from '../services/infura.service';
import { ENSService } from '../services/ens.service';
import { environment } from 'src/environments/environment';
import { ResourceLoader } from '@angular/compiler';

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

	universityEtherscan =
		'https://' +
		environment.network +
		'.etherscan.io/address/' +
		environment.universityAddress;
	universityName: any;
	universityENSName: any;
	universityENSNameRecord = false;
	universityENSTTL: any;
	universityENSDescription = 'Loading...';
	universityENSNotice: any;
	universityENSHasNotice = false;
	universityDisplayNotice = true;
	universityCut: any;
	universityFunds: any;
	universityBudget: any;
	universityDonations: any;
	universityRevenue: any;
	universityReturns: any;
	universityAdmin: any;
	universityParams: any;

	//StudentSelfRegister
	public _name = 'any';
	address: any;

	//Finished loading classlist info
	public classlistLoaded = false;

	public userIsUniversityAdmin: boolean;
	public mode = 'unconnected';
	public modeUniversityAdmin = 'unconnected';
	public txMode = 'off';
	public receipt: any;
	public connectedPortis = false;
	public form: FormGroup;
	public students: Student[] = [];
	public classrooms = new Array<Classroom>();
	selectedClassroom: Classroom;
	service: PortisService | InfuraService;

	constructor(
		private modalService: ModalService,
		public portisService: PortisService,
		public infuraService: InfuraService,
		public ensService: ENSService
	) {}

	ngOnInit() {
		this.service = this.infuraService;
		this.ensService
			.configureProvider(this.infuraService.provider, false)
			.then(() => this.refreshUniversityInfo());
	}

	openModal(id: string) {
		this.modalService.open(id);
	}

	closeModal(id: string) {
		this.modalService.close(id);
	}

	closeUniversityNotice() {
		this.universityDisplayNotice = false;
	}

	onSelect(classroom: Classroom): void {
		this.selectedClassroom = classroom;
	}

	txOn() {
		this.txMode = 'preTX';
	}

	txOff() {
		this.txMode = 'off';
	}

	clear() {
		this.form.reset();
	}

	async conectPortis(): Promise<any> {
		this.mode = 'loadingPage';
		const answer = await this.portisService.initPortis();
		if (!answer) {
			this.mode = 'unconnected';
			return;
		}
		this.address = await this.portisService.getAddress();
		const connectUniversity = await this.portisService.conectUniversity();
		this.mode = 'connected';
		this.connectedPortis = true;
		this.service = this.portisService;
		this.ensService.configureProvider(this.portisService.provider);
		await this.refreshUniversityInfo();
		const adminAddress = await this.portisService.getUniversityOwner();
		this.userIsUniversityAdmin = this.address === adminAddress;
		//TODO: Student Address and Student Smart Contract Address
		//const adminAddress = await this.portisService.getUniversityOwner();
		//this.userIsUniversityAdmin = (this.address === adminAddress);
	}

	async refreshUniversityInfo(): Promise<any> {
		this.refreshUniversityMetadata();
		this.updateClassrooms().then(() => (this.classlistLoaded = true));
	}

	async refreshUniversityMetadata() {
		this.universityENSName = await this.ensService.lookupAddress(
			environment.universityAddress
		);
		this.universityENSNameRecord = await this.ensService.checkENSRecord();
		this.universityENSTTL = await this.ensService.getTTL();
		this.universityENSDescription = await this.ensService.getTxDescription();
		this.universityENSNotice = await this.ensService.getTxNotice();
		this.universityENSHasNotice = this.universityENSNotice.length > 0;
		this.universityName = await this.service.getUniversityName();
		this.universityCut = await this.service.getUniversityCut();
		this.universityDonations = await this.service.getUniversityDonations();
		this.universityFunds = await this.service.getUniversityFunds();
		this.universityBudget = await this.service.getUniversityBudget();
		this.universityRevenue = await this.service.getUniversityRevenue();
		this.universityReturns = await this.service.getUniversityReturns();
		this.universityParams = await this.service.getUniversityParams();
	}

	async updateENSNotice(text: string) {
		await this.service.setTxRecord(this.ensService.node, 'notice', text);
		await this.refreshUniversityMetadata();
	}

	async updateENSDescription(text: string) {
		await this.service.setTxRecord(
			this.ensService.node,
			'description',
			text
		);
		await this.refreshUniversityMetadata();
	}

	async setupUniversityENS() {
		const normalName = this.universityName.toLowerCase().replace(/\s/g, '');
		if (!this.universityENSNameRecord)
			await this.service.registerInRegistrar(normalName);
		const node = this.ensService.node;
		await this.service.setResolver(node);
		await this.service.setAddr(node, environment.universityAddress);
		await this.service.setReverse(normalName + environment.ENSDomain);
	}

	async updateClassrooms() {
		let classroomCount = await this.service.getClassroomCount();
		if (this.classrooms.length == classroomCount + CLASSROOMS.length)
			return;
		this.classlistLoaded = false;
		this.classrooms = new Array<Classroom>();
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
			] = await this.service.getClassroomInfo(index);
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
			this.classrooms.push(newClassroom);
			this.refreshClassroomMetadata(newClassroom);
			index++;
		}
		CLASSROOMS.forEach((element) => {
			this.classrooms.push(element);
		});
	}

	async refreshClassroomMetadata(classroom: Classroom) {
		const normalName = classroom.title.toLowerCase().replace(/\s/g, '');
		const node = this.ensService.getSubNode(normalName);
		const record = await this.ensService.hasRecord(node);
		if (!record) return;
		classroom.metadata.email = await this.ensService.getTxEmail(node);
		classroom.metadata.url = await this.ensService.getTxURL(node);
		classroom.metadata.avatar = await this.ensService.getTxAvatar(node);
		classroom.metadata.description = await this.ensService.getTxDescription(
			node
		);
		classroom.metadata.notice = await this.ensService.getTxNotice(node);
		classroom.metadata.keywords = await this.ensService.getTxKeywordsArray(
			node
		);
	}

	async refreshAccountInfo(): Promise<any> {
		this.address = await this.service.getAddress();
		//TODO: call student smart contract
	}

	async studentSelfRegister(): Promise<any> {
		this.txOn();
		if (this._name == '') {
			this.txMode = 'failedTX';
		} else {
			this.txMode = 'processingTX';
			const selfRegister = await this.service.studentSelfRegister(
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

	getClassrooms(id: Number) {
		const data = localStorage.getItem('classrooms');
		console.log(data);
		if (data) {
			this.classrooms = JSON.parse(data);
		} else {
			this.classrooms = [];
		}
	}

	revokeRole(role: string, address: string) {
		this.service
			.revokeRole(role, address)
			.then(() => this.loadUniversityAdmin());
	}

	grantRole(role: string, address: string) {
		this.service
			.grantRole(role, address)
			.then(() => this.loadUniversityAdmin());
	}

	roleMembersAdmin: Map<string, Array<GenericUser>>;

	loadUniversityAdmin() {
		this.modeUniversityAdmin = 'unconnected';
		this.roleMembersAdmin = new Map<string, Array<GenericUser>>();
		this.getRoleMembers('DEFAULT_ADMIN_ROLE').then((result) => {
			this.roleMembersAdmin['DEFAULT_ADMIN_ROLE'] = result;
		});
		this.getRoleMembers('FUNDS_MANAGER_ROLE').then((result) => {
			this.roleMembersAdmin['FUNDS_MANAGER_ROLE'] = result;
		});
		this.getRoleMembers('CLASSLIST_ADMIN_ROLE').then((result) => {
			this.roleMembersAdmin['CLASSLIST_ADMIN_ROLE'] = result;
		});
		this.getRoleMembers('GRANTS_MANAGER_ROLE').then((result) => {
			this.roleMembersAdmin['GRANTS_MANAGER_ROLE'] = result;
		});
		this.getRoleMembers('UNIVERSITY_OVERSEER_ROLE').then((result) => {
			this.roleMembersAdmin['UNIVERSITY_OVERSEER_ROLE'] = result;
		});
		this.getRoleMembers('REGISTERED_SUPPLIER_ROLE').then((result) => {
			this.roleMembersAdmin['REGISTERED_SUPPLIER_ROLE'] = result;
		});
		this.getRoleMembers('READ_STUDENT_LIST_ROLE').then((result) => {
			this.roleMembersAdmin['READ_STUDENT_LIST_ROLE'] = result;
			this.modeUniversityAdmin = 'loaded';
		});
	}

	public async setUniversityOwner(param) {}

	public async setUniversityName(param) {}

	public async setUniversityCut(param) {}

	public async setUniversityParams(param) {}

	public createClassroom(
		_Owner: string,
		_Name: string,
		_Price: string,
		_Cutfromprincipal: string,
		_Cutfromsuccesspool: string,
		_Minimumscore: string,
		_Duration: string,
		_Challengeaddress: string
	) {
		this.service
			.createClassroom(
				_Owner,
				_Name,
				_Price,
				Number(_Cutfromprincipal),
				Number(_Cutfromsuccesspool),
				Number(_Minimumscore),
				Number(_Duration),
				_Challengeaddress
			)
			.then(() => this.updateClassrooms());
	}

	async teacherClaimSubnode(label, owner, classroom){
		const node = this.ensService.node;
		const normalName = label.toLowerCase().replace(/\s/g, '');
		await this.service.claimSubnodeClassroom(node, normalName, owner, classroom);
	}

	async studentClaimSubnode(label, owner, classroom){
		const node = this.ensService.node;
		const normalName = label.toLowerCase().replace(/\s/g, '');
		await this.service.claimSubnodeStudent(node, normalName, owner, classroom);
	}

	async getRoleMembers(role: string) {
		return await this.service.listRoles(role);
	}
}
