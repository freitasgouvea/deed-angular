import { Injectable } from '@angular/core';
//import Web3 from 'web3';
import * as ethers from 'ethers';
import { environment } from '../../environments/environment';

import * as University from '../../../build/contracts/University.json';
import * as Classroom from '../../../build/contracts/Classroom.json';
import { GenericUser } from '../../models/genericUser.model';

@Injectable({
	providedIn: 'root',
})
export class baseClientService {
	public universityContractInstance: any;
	public provider: any;
	public networkName: any;

	constructor() {}

	public setupProvider(_provider) {
		this.provider = _provider;
	}

	public connectContracts(providerOrSigner) {
		this.universityContractInstance = new ethers.Contract(
			environment.universityAddress,
			University.abi,
			providerOrSigner
		);
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
		const transaction = await this.universityContractInstance.revokeRole(roleBytes, address);
		console.log(transaction);
		await transaction.wait();
		console.log(transaction);
	}

	async grantRole(role: string, address: string) {
		const roleBytes =
			role == 'DEFAULT_ADMIN_ROLE'
				? ethers.utils.formatBytes32String('')
				: ethers.utils.solidityKeccak256(['string'], [role]);
		const transaction = await this.universityContractInstance.grantRole(roleBytes, address);
		console.log(transaction);
		await transaction.wait();
		console.log(transaction);
	}

	public async studentSelfRegister(_name: string) {
		const name = ethers.utils.formatBytes32String(_name);
		const register = await this.universityContractInstance.studentSelfRegister(
			name
		);
		console.log(register);
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
			price,
			minScore,
			cutPrincipal,
			cutPool,
			isOpen,
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
		price = await classroomContractInstance.price();
		minScore = await classroomContractInstance.minScore();
		cutPrincipal = await classroomContractInstance.principalCut();
		cutPool = await classroomContractInstance.poolCut();
		isOpen = await classroomContractInstance.openForApplication();
		isActive = await classroomContractInstance.classroomActive();
		isFinished = await classroomContractInstance.courseFinished();
		addressChallenge = await classroomContractInstance.challengeAddress();
		owner = await classroomContractInstance.owner();
		return [
			title,
			smartcontract,
			startDate,
			finishDate,
			price,
			minScore,
			cutPrincipal,
			cutPool,
			isOpen,
			isActive,
			isFinished,
			addressChallenge,
			owner
		];
	}

	async createClassroom(
		_Owner,
		_Name,
		_Price,
		_Cutfromprincipal,
		_Cutfromsuccesspool,
		_Minimumscore,
		_Duration,
		_Challengeaddress
	) {
		await this.universityContractInstance.newClassRoom(
			_Owner,
			_Name,
			_Cutfromprincipal,
			_Cutfromsuccesspool,
			_Minimumscore,
			_Price,
			_Duration,
			_Challengeaddress
		);
	}
}
