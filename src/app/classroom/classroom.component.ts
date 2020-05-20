import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Classroom } from 'src/models/classroom.model';
import { ModalService } from '../_modal';
import { Globals } from '../app.globals';

import { PortisService } from '../services/portis.service';
import { InfuraService } from '../services/infura.service';
import { environment } from 'src/environments/environment';
import { ENSService } from '../services/ens.service';
import { ethers } from 'ethers';
import * as Web3 from 'web3';
import { StudentApplication } from 'src/models/studentApplication.model';

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
	public txMode = 'off';

	public myStudentApplication: StudentApplication;

	constructor(
		public globals: Globals,
		private modalService: ModalService,
		public portisService: PortisService
	) {}

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
		if (!this.globals.selectedStudent) return;
		this.globals.service.viewMyApplication().then((address) =>{
			this.myStudentApplication = new StudentApplication(this.globals, address, this.globals.address);
			this.myStudentApplication.classroomAddress = this.globals.selectedClassroom.smartcontract;
			this.globals.service.viewMyApplicationState(this.globals.selectedClassroom.smartcontract).then((state) => this.myStudentApplication.state = state)
		})
	}

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

	txOn() {
		this.txMode = 'preTX';
	}

	txOff() {
		this.txMode = 'off';
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
		if (this.globals.classrooms.length == classroomCount) return;
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

	public refreshClassroomInfo() {
		this.globals.service
			.getClassroomOwner()
			.then(
				(adminAddress) =>
					(this.globals.userIsClassroomAdmin =
						this.globals.address == adminAddress)
			);
		this.refreshClassroomFunds();
		this.refreshClassroomMetadata();
		if (!this.userIsClassroomAdmin) return;
		this.refreshClassroomConfigs();
		this.refreshClassroomParams();
		this.refreshClassroomData();
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

	async setMetadataRecord(type: string, text: string) {
		const normalName = this.globals.selectedClassroom.title
			.toLowerCase()
			.replace(/\s/g, '');
		const node = this.globals.ensService.getSubNode(normalName);
		await this.globals.ensService.setTxRecord(type, text, node);
	}

	async refreshClassroomMetadata(
		classroom: Classroom = this.globals.selectedClassroom
	) {
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

	refreshClassroomFunds(
		classroom: Classroom = this.globals.selectedClassroom
	) {
		this.globals.service
			.getDAIBalance(this.globals.selectedClassroom.smartcontract)
			.then(
				(val) =>
					(this.globals.selectedClassroom.funds.DAI = Number(
						ethers.utils.formatEther(val)
					))
			);
		this.globals.service
			.getLINKBalance(this.globals.selectedClassroom.smartcontract)
			.then(
				(val) =>
					(this.globals.selectedClassroom.funds.LINK = Number(
						ethers.utils.formatEther(val)
					))
			);
	}

	async exchangeDAI_LINK(val: number) {}

	async exchangeLINK_DAI(val: number) {}

	refreshClassroomConfigs(
		classroom: Classroom = this.globals.selectedClassroom
	) {
		//TODO: abstract service
		this.globals.service.classroomContractInstance
			.oracleRandom()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.oracleRandom = val)
			);
		this.globals.service.classroomContractInstance
			.requestIdRandom()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.requestIdRandom = val)
			);
		this.globals.service.classroomContractInstance
			.oraclePaymentRandom()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.oraclePaymentRandom = val)
			);
		this.globals.service.classroomContractInstance
			.oracleTimestamp()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.oracleTimestamp = val)
			);
		this.globals.service.classroomContractInstance
			.requestIdTimestamp()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.requestIdTimestamp = val)
			);
		this.globals.service.classroomContractInstance
			.oraclePaymentTimestamp()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.oraclePaymentTimestamp = val)
			);
		this.globals.service.classroomContractInstance
			.linkToken()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.linkToken = val)
			);
		this.globals.service.classroomContractInstance
			.uniswapDAI()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.uniswapDAI = val)
			);
		this.globals.service.classroomContractInstance
			.uniswapLINK()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.uniswapLINK = val)
			);
		this.globals.service.classroomContractInstance
			.uniswapRouter()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.uniswapRouter = val)
			);
		this.globals.service.classroomContractInstance
			.aaveProvider()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.aaveProvider = val)
			);
		this.globals.service.classroomContractInstance
			.aaveLendingPool()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.aaveLendingPool = val)
			);
		this.globals.service.classroomContractInstance
			.aaveLendingPoolCore()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.aaveLendingPoolCore = val)
			);
		this.globals.service.classroomContractInstance
			.aTokenDAI()
			.then(
				(val) =>
					(this.globals.selectedClassroom.configs.aTokenDAI = val)
			);
	}

	refreshClassroomParams(
		classroom: Classroom = this.globals.selectedClassroom
	) {
		//TODO: abstract service
		this.globals.service.classroomContractInstance
			.compoundApplyPercentage()
			.then((val) => {
				this.globals.selectedClassroom.params.compoundApplyPercentage =
					val / 1e4;
				this.globals.selectedClassroom.params.aaveApplyPercentage =
					100 -
					this.globals.selectedClassroom.params
						.compoundApplyPercentage;
			});
	}

	refreshClassroomData(
		classroom: Classroom = this.globals.selectedClassroom
	) {
		//TODO: abstract service
		this.globals.service.classroomContractInstance
			.countNewApplications()
			.then(
				(val) =>
					(this.globals.selectedClassroom.classdata.students = val)
			);
		this.globals.service.classroomContractInstance
			.countReadyApplications()
			.then(
				(val) =>
					(this.globals.selectedClassroom.classdata.validStudents = val)
			);
	}

	openApplications() {
		this.globals.service.classroomContractInstance
			.openApplications()
			.then((tx) => tx.wait().then(() => this.refreshClassroomInfo()));
	}

	closeApplications() {
		this.globals.service.classroomContractInstance
			.closeApplications()
			.then((tx) => tx.wait().then(() => this.refreshClassroomInfo()));
	}

	beginCourse() {
		this.globals.service.classroomContractInstance
			.beginCourse(true)
			.then((tx) => tx.wait().then(() => this.refreshClassroomInfo()));
	}

	configureUniswap(
		uniswapDAI: string,
		uniswapLINK: string,
		uniswapRouter: string
	) {
		//TODO: abstract service
		uniswapDAI = uniswapDAI ? uniswapDAI : environment.DAIAddress;
		uniswapLINK = uniswapLINK ? uniswapLINK : environment.LINKAddress;
		uniswapRouter = uniswapRouter
			? uniswapRouter
			: environment.UniswapRouter;
		this.globals.service.classroomContractInstance
			.configureUniswap(uniswapDAI, uniswapLINK, uniswapRouter)
			.then((tx) => tx.wait().then(() => this.refreshClassroomConfigs()));
	}

	configureOracles(
		oracleRandom: string,
		requestIdRandom: string,
		oraclePaymentRandom: number,
		oracleTimestamp: string,
		requestIdTimestamp: string,
		oraclePaymentTimestamp: number,
		linkToken: string
	) {
		//TODO: abstract service
		oracleRandom = oracleRandom
			? oracleRandom
			: environment.ChainlinkOracleRandom;
		requestIdRandom = requestIdRandom
			? requestIdRandom
			: environment.ChainlinkRequestIdRandom;
		oraclePaymentRandom = oraclePaymentRandom
			? oraclePaymentRandom
			: environment.ChainlinkOraclePaymentRandom;
		oracleTimestamp = oracleTimestamp
			? oracleTimestamp
			: environment.ChainlinkOracleTimestamp;
		requestIdTimestamp = requestIdTimestamp
			? requestIdTimestamp
			: environment.ChainlinkRequestIdTimestamp;
		oraclePaymentTimestamp = oraclePaymentTimestamp
			? oraclePaymentTimestamp
			: environment.ChainlinkOraclePaymentTimestamp;
		linkToken = linkToken ? linkToken : environment.LINKAddress;
		this.globals.service.classroomContractInstance
			.configureOracles(
				oracleRandom,
				requestIdRandom,
				oraclePaymentRandom,
				oracleTimestamp,
				requestIdTimestamp,
				oraclePaymentTimestamp,
				linkToken,
				true
			)
			.then((tx) => tx.wait().then(() => this.refreshClassroomConfigs()));
	}

	configureAave(lendingPoolAddressesProvider: string) {
		lendingPoolAddressesProvider = lendingPoolAddressesProvider
			? lendingPoolAddressesProvider
			: environment.AaveLendingPoolAddressesProvider;
		this.globals.service.classroomContractInstance
			.configureAave(lendingPoolAddressesProvider)
			.then((tx) => tx.wait().then(() => this.refreshClassroomConfigs()));
	}

	async applyClassroom(classroomAddress: string = this.globals.selectedClassroom.smartcontract): Promise<any> {
		this.txOn();
		if (classroomAddress == '') {
			this.txMode = 'failedTX';
		} else {
			this.txMode = 'processingTX';
			const application = await this.globals.service.applyToClassroom(
				classroomAddress
			);
			if (!application) {
				this.txMode = 'failedTX';
			} else {
				this.txMode = 'successTX';
			}
		}
	}

	async sendAnswer(secret: string): Promise<any> {
		this.txOn();
		const classroomAddress = this.globals.selectedClassroom.smartcontract;
		if (classroomAddress == '' || secret == '') {
			this.txMode = 'failedTX';
		} else {
			this.txMode = 'processingTX';
			const application = await this.globals.service.setAnswerSecret(
				classroomAddress, secret
			);
			if (!application) {
				this.txMode = 'failedTX';
			} else {
				this.txMode = 'successTX';
			}
		}
	}

	async colletcReward(): Promise<any> {
		this.txOn();
		const classroomAddress = this.globals.selectedClassroom.smartcontract;
		const studentAddress = this.globals.address;
		if (classroomAddress == '' || studentAddress == '') {
			this.txMode = 'failedTX';
		} else {
			this.txMode = 'processingTX';
			const application = await this.globals.service.withdrawAllResultsFromClassroom(
				classroomAddress, studentAddress
			);
			if (!application) {
				this.txMode = 'failedTX';
			} else {
				this.txMode = 'successTX';
			}
		}
	}
}
