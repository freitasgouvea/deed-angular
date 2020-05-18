import { Injectable } from '@angular/core';
//import Web3 from 'web3';
import * as ethers from 'ethers';
import { environment } from '../../environments/environment';

import * as University from '../../../build/contracts/University.json';
import * as Classroom from '../../../build/contracts/Classroom.json';
import * as Student from '../../../build/contracts/Student.json';
import { GenericUser } from '../../models/genericUser.model';

@Injectable({
	providedIn: 'root',
})
export class baseClientService {
	public universityContractInstance: any;
	public classroomContractInstance: any;
	public studentContractInstance: any;
	public provider: any;
	public networkName: any;

	constructor() {}

	public setupProvider(_provider) {
		this.provider = _provider;
	}

	async getAddress() {
		const addresses = await this.provider.listAccounts();
		return addresses[0];
	}

	async conectUniversity() {
		if (!environment.universityAddress)
			throw new Error('invalid contract address!');
		if (!University || !University.abi)
			throw new Error(
				'invalid contract json, try to run truffle compile!'
			);
		if (this.provider) {
			this.universityContractInstance = new ethers.Contract(
				environment.universityAddress,
				University.abi,
				this.provider.getSigner()
			);
		} else {
			console.warn('try to connect with portis!');
			this.provider = new ethers.providers.JsonRpcProvider(
				'http://localhost:8545'
			);
		}
	}

	async conectClassroom(address: string) {
		if (!address)
			throw new Error('invalid contract address!');
		if (!Classroom || !Classroom.abi)
			throw new Error(
				'invalid contract json, try to run truffle compile!'
			);
		if (this.provider) {
			this.classroomContractInstance = new ethers.Contract(
				address,
				Classroom.abi,
				this.provider.getSigner()
			);
		} else {
			console.warn('try to connect with portis!');
			this.provider = new ethers.providers.JsonRpcProvider(
				'http://localhost:8545'
			);
		}
	}

	async conectStudent() {
		const smartContractAddress = await this.getStudentSmartContract();
		if (!smartContractAddress)
			throw new Error('invalid contract smartContractAddress!');
		if (!Student || !Student.abi)
			throw new Error(
				'invalid contract json, try to run truffle compile!'
			);
		if (this.provider) {
			this.studentContractInstance = new ethers.Contract(
				smartContractAddress,
				Student.abi,
				this.provider.getSigner()
			);
		} else {
			console.warn('try to connect with portis!');
			this.provider = new ethers.providers.JsonRpcProvider(
				'http://localhost:8545'
			);
		}
	}

	public async isStudentRegistred() {
		const studentAdress = await this.getAddress();
		const check = await this.universityContractInstance.studentIsRegistered(studentAdress);
		return check;
	}

	public async getStudentSmartContract() {
		const studentSmartContract = await this.universityContractInstance.myStudentAddress();
		console.log(studentSmartContract);
		return studentSmartContract;
	}
	
	public async getClassroomOwner() {
		const answer = await this.classroomContractInstance.owner();
	}

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
		text = text + await this.universityContractInstance.daiToken() + ',';
		text = text + await this.universityContractInstance.cDAI() + ',';
		text = text + await this.universityContractInstance.relayHub() + ',';
		text = text + await this.universityContractInstance.classroomFactory() + ',';
		text = text + await this.universityContractInstance.studentFactory() + ',';
		text = text + await this.universityContractInstance.studentApplicationFactory() + ',';
		text = text + await this.universityContractInstance.ensContract() + ',';
		text = text + await this.universityContractInstance.ensTestRegistrar() + ',';
		text = text + await this.universityContractInstance.ensPublicResolver() + ',';
		text = text + await this.universityContractInstance.ensReverseRegistrar();
		return text;
	}

	public async setUniversityParams(params: string) {
		const paramsArray = params.split(',');
		await this.universityContractInstance.updateAddresses(...paramsArray);
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

	async registerInRegistrar(label: string){
		const tx = await this.universityContractInstance.registerInRegistrar(ethers.utils.solidityKeccak256(['string'], [label]), environment.universityAddress);
		await tx.wait();
	}

	async setResolver(node: string){
		const tx = await this.universityContractInstance.setResolver(node, environment.ENSPulbicResolverAddress);
		await tx.wait();
	}

	async setAddr(node: string, address: string){
		const tx = await this.universityContractInstance.setAddressInResolver(node, address);
		await tx.wait();
	}

	async setReverse(name: string){
		const tx = await this.universityContractInstance.registerInReverseRegistrar(name);
		await tx.wait();
	}

	public async setTxRecord(_node, key, text) {
		const tx = await this.universityContractInstance.setTextInResolver(_node, key, text, environment.ENSPulbicResolverAddress);
		await tx.wait();
	}

	public async claimSubnodeClassroom(_node, label, owner, classroom) {
		const tx = await this.universityContractInstance.claimSubnodeClassroom(_node, ethers.utils.solidityKeccak256(['string'], [label]), owner, environment.ENSPulbicResolverAddress, 0, classroom);
		await tx.wait();
	}

	public async claimSubnodeStudent(_node, label, owner, student) {
		const tx = await this.universityContractInstance.claimSubnodeStudent(_node, ethers.utils.solidityKeccak256(['string'], [label]), owner, environment.ENSPulbicResolverAddress, 0, student);
		await tx.wait();
	}
}
