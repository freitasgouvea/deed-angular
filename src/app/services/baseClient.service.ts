import { Injectable } from '@angular/core';
//import Web3 from 'web3';
import * as ethers from 'ethers';
import { environment } from '../../environments/environment';

import * as University from '../../../build/contracts/University.json';
import * as Classroom from '../../../build/contracts/Classroom.json';
import * as Student from '../../../build/contracts/Student.json';
import * as DAI from '../../../build/contracts/ERC20.json';
import * as CDAI from '../../../build/contracts/CERC20.json';
import * as ADAI from '../../../build/contracts/aToken.json';
import { GenericUser } from '../../models/genericUser.model';

@Injectable({
	providedIn: 'root',
})
export class baseClientService {
	public universityContractInstance: any;
	public classroomContractInstance: any;
	public studentContractInstance: any;
	public DAIContract: any;
	public CDAIContract: any;
	public ADAIContract: any;
	public provider: any;
	public networkName: any;
	public useSigner = false;

	constructor() {}

	public async setupProvider(_provider) {
		this.provider = _provider;
		this.setupPublicTokens();
		await this.connectUniversity();
	}

	// Contracts setup

	public setupPublicTokens() {
		const providerOrSigner = this.useSigner
			? this.provider.getSigner()
			: this.provider;
		this.DAIContract = new ethers.Contract(
			environment.DAIAddress,
			DAI.abi,
			providerOrSigner
		);
		this.CDAIContract = new ethers.Contract(
			environment.CompoundDAIAddress,
			CDAI.abi,
			providerOrSigner
		);
		this.ADAIContract = new ethers.Contract(
			environment.AaveDAIAddress,
			ADAI.abi,
			providerOrSigner
		);
	}

	async getAddress() {
		const addresses = await this.provider.listAccounts();
		return addresses[0];
	}

	async connectUniversity() {
		const providerOrSigner = this.useSigner
			? this.provider.getSigner()
			: this.provider;
		if (this.checkContractInfo(environment.universityAddress, University))
			this.universityContractInstance = new ethers.Contract(
				environment.universityAddress,
				University.abi,
				providerOrSigner
			);
		await this.universityContractInstance.deployed();
	}

	async connectClassroom(address: string) {
		const providerOrSigner = this.useSigner
			? this.provider.getSigner()
			: this.provider;
		if (this.checkContractInfo(address, Classroom))
			this.classroomContractInstance = new ethers.Contract(
				address,
				Classroom.abi,
				providerOrSigner
			);
	}

	async connectStudent() {
		const providerOrSigner = this.useSigner
			? this.provider.getSigner()
			: this.provider;
		const smartContractAddress = await this.getStudentSmartContract();
		if (this.checkContractInfo(smartContractAddress, Student))
			this.studentContractInstance = new ethers.Contract(
				smartContractAddress,
				Student.abi,
				providerOrSigner
			);
		console.log(this.studentContractInstance);
	}

	public checkContractInfo(address: string, file: any): boolean {
		if (!address || address.length < 40)
			throw new Error('invalid contract address!');
		if (!Classroom || !Classroom.abi)
			throw new Error(
				'invalid contract json, try to run truffle compile!'
			);
		if (this.provider) return true;
		else {
			console.warn('try to connect with portis!');
			this.provider = new ethers.providers.JsonRpcProvider(
				'http://localhost:8545'
			);
		}
		return false;
	}

	// View Token info

	public async getDAIBalance(address: string) {
		const val = await this.DAIContract.balanceOf(address);
		return val;
	}

	// View Student info

	public async isStudentRegistred(): Promise<boolean> {
		const studentAdress = await this.getStudentSmartContract();
		if (!studentAdress) return false;
		const check = await this.universityContractInstance.studentIsRegistered(
			studentAdress
		);
		return check;
	}

	public async getStudentSmartContract() {
		try {
			const studentSmartContract = await this.universityContractInstance.myStudentAddress();
			return studentSmartContract;
		} catch (err) {}
	}

	public async getStudentName() {
		const answer = await this.studentContractInstance.name();
		const val = ethers.utils.parseBytes32String(answer);
		return val;
	}

	public async getScore() {
		const val = await this.studentContractInstance.score();
		return val;
	}

	public async getApplications() {
		const applications = await this.universityContractInstance.viewMyApplications();
		return applications;
	}

	// View Classroom info
	
	public async getClassroomOwner() {
		const answer = await this.universityContractInstance.owner();
		return answer;
	}

	// View University info

	public async getUniversityOwner() {
		const answer = await this.universityContractInstance.owner();
		return answer;
	}

	public async getUniversityName() {
		const answer = await this.universityContractInstance.name();
		const val = ethers.utils.parseBytes32String(answer);
		return val;
	}

	public async getUniversityCut() {
		const answer = await this.universityContractInstance.cut();
		const val = answer / 1e4;
		return val;
	}

	public async getUniversityFunds() {
		const answer = await this.universityContractInstance.availableFunds();
		const val = ethers.utils.formatEther(answer);
		return val;
	}

	public async getUniversityBudget() {
		const answer = await this.universityContractInstance.operationalBudget();
		const val = ethers.utils.formatEther(answer);
		return val;
	}

	public async getUniversityDonations() {
		const answer = await this.universityContractInstance.donationsReceived();
		const val = ethers.utils.formatEther(answer);
		return val;
	}

	public async getUniversityRevenue() {
		const answer = await this.universityContractInstance.revenueReceived();
		const val = ethers.utils.formatEther(answer);
		return val;
	}

	public async getUniversityReturns() {
		const answer = await this.universityContractInstance.returnsReceived();
		const val = ethers.utils.formatEther(answer);
		return val;
	}

	public async getUniversityParams() {
		let text = '';
		text = text + (await this.universityContractInstance.daiToken()) + ',';
		text = text + (await this.universityContractInstance.cDAI()) + ',';
		text = text + (await this.universityContractInstance.relayHub()) + ',';
		text =
			text +
			(await this.universityContractInstance.classroomFactory()) +
			',';
		text =
			text +
			(await this.universityContractInstance.studentFactory()) +
			',';
		text =
			text +
			(await this.universityContractInstance.studentApplicationFactory()) +
			',';
		text =
			text + (await this.universityContractInstance.ensContract()) + ',';
		text =
			text +
			(await this.universityContractInstance.ensTestRegistrar()) +
			',';
		text =
			text +
			(await this.universityContractInstance.ensPublicResolver()) +
			',';
		text =
			text +
			(await this.universityContractInstance.ensReverseRegistrar());
		return text;
	}

	public async listRoles(role: string) {
		let list: Array<GenericUser> = [];
		const roleBytes =
			role == 'DEFAULT_ADMIN_ROLE'
				? ethers.utils.formatBytes32String('')
				: ethers.utils.solidityKeccak256(['string'], [role]);
		const size = await this.universityContractInstance.getRoleMemberCount(
			roleBytes
		);
		let index = 0;
		while (index < size) {
			const member = await this.universityContractInstance.getRoleMember(
				roleBytes,
				index
			);
			list.push(new GenericUser(index, member));
			index++;
		}
		return list;
	}

	async getClassroomCount() {
		const roleBytes = ethers.utils.solidityKeccak256(
			['string'],
			['CLASSROOM_PROFESSOR_ROLE']
		);
		return await this.universityContractInstance.getRoleMemberCount(
			roleBytes
		);
	}

	async getClassroomInfo(index) {
		let title,
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
			owner;
		const roleBytes = ethers.utils.solidityKeccak256(
			['string'],
			['CLASSROOM_PROFESSOR_ROLE']
		);
		smartcontract = await this.universityContractInstance.getRoleMember(
			roleBytes,
			index
		);
		let classroomContractInstance = new ethers.Contract(
			smartcontract,
			Classroom.abi,
			this.provider
		);
		const answer = await classroomContractInstance.name();
		title = ethers.utils.parseBytes32String(answer);
		const priceWei = await classroomContractInstance.entryPrice();
		price = ethers.utils.formatEther(priceWei);
		minScore = await classroomContractInstance.minScore();
		cutPrincipal = await classroomContractInstance.principalCut();
		cutPool = await classroomContractInstance.poolCut();
		isOpen = await classroomContractInstance.openForApplication();
		isEmpty = await classroomContractInstance.isClassroomEmpty();
		isActive = await classroomContractInstance.classroomActive();
		isFinished = await classroomContractInstance.courseFinished();
		duration = await classroomContractInstance.duration();
		startDate = await classroomContractInstance.startDate();
		finishDate = startDate > 0 ? startDate + duration : 0;
		addressChallenge = await classroomContractInstance.challengeAddress();
		owner = await classroomContractInstance.owner();
		return [
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
		];
	}

	// Signed interactions with University contract

	public async setUniversityParams(params: string) {
		const paramsArray = params.split(',');
		await this.universityContractInstance.updateAddresses(...paramsArray);
	}

	async revokeRole(role: string, address: string) {
		if (role == 'DEFAULT_ADMIN_ROLE') return;
		const roleBytes = ethers.utils.solidityKeccak256(['string'], [role]);
		const transaction = await this.universityContractInstance.revokeRole(
			roleBytes,
			address
		);
		await transaction.wait();
	}

	async grantRole(role: string, address: string) {
		const roleBytes =
			role == 'DEFAULT_ADMIN_ROLE'
				? ethers.utils.formatBytes32String('')
				: ethers.utils.solidityKeccak256(['string'], [role]);
		const transaction = await this.universityContractInstance.grantRole(
			roleBytes,
			address
		);
		await transaction.wait();
	}

	public async studentSelfRegister(_name: string) {
		const name = ethers.utils.formatBytes32String(_name);
		const register = await this.universityContractInstance.studentSelfRegister(
			name
		);
		await register.wait();
		return register;
	}

	public async studentUpdateName(newName: string) {
		const name = ethers.utils.formatBytes32String(newName);
		const register = await this.studentContractInstance.changeName(
			name
		);
		await register.wait();
		return register;
	}

	async createClassroom(
		_Owner: string,
		_Name: string,
		_Price: string,
		_Cutfromprincipal: number,
		_Cutfromsuccesspool: number,
		_Minimumscore: number,
		_Duration: number,
		_Challengeaddress: string
	) {
		await this.universityContractInstance.newClassRoom(
			_Owner,
			ethers.utils.formatBytes32String(_Name),
			Math.round(_Cutfromprincipal * 1e4),
			Math.round(_Cutfromsuccesspool * 1e4),
			Math.round(_Minimumscore),
			ethers.utils.parseEther(_Price),
			Math.round(_Duration * 60 * 60 * 24),
			_Challengeaddress
		);
	}

	// ENS Signed actions

	async registerInRegistrar(label: string) {
		const tx = await this.universityContractInstance.registerInRegistrar(
			ethers.utils.solidityKeccak256(['string'], [label]),
			environment.universityAddress
		);
		await tx.wait();
	}

	async setResolver(node: string) {
		const tx = await this.universityContractInstance.setResolver(
			node,
			environment.ENSPulbicResolverAddress
		);
		await tx.wait();
	}

	async setAddr(node: string, address: string) {
		const tx = await this.universityContractInstance.setAddressInResolver(
			node,
			address
		);
		await tx.wait();
	}

	async setReverse(name: string) {
		const tx = await this.universityContractInstance.registerInReverseRegistrar(
			name
		);
		await tx.wait();
	}

	public async setTxRecord(_node, key, text) {
		const tx = await this.universityContractInstance.setTextInResolver(
			_node,
			key,
			text,
			environment.ENSPulbicResolverAddress
		);
		await tx.wait();
	}

	public async claimSubnodeClassroom(_node, label, owner, classroom) {
		const tx = await this.universityContractInstance.claimSubnodeClassroom(
			_node,
			ethers.utils.solidityKeccak256(['string'], [label]),
			owner,
			environment.ENSPulbicResolverAddress,
			0,
			classroom
		);
		await tx.wait();
	}

	public async claimSubnodeStudent(_node, label, owner, student) {
		const tx = await this.universityContractInstance.claimSubnodeStudent(
			_node,
			ethers.utils.solidityKeccak256(['string'], [label]),
			owner,
			environment.ENSPulbicResolverAddress,
			0,
			student
		);
		await tx.wait();
		if (!tx) {
			return false;
		} else {
			return true;
		}
	}

	//Classroom actions

	public async applyToClassroom(classroomAddress: string) {
		const application = await this.studentContractInstance.applyToClassroom(
			classroomAddress
		);
		await application.wait();
		return application;
	}

}
