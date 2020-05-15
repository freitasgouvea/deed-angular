import { Injectable } from '@angular/core';
import Portis from '@portis/web3';
//import Web3 from 'web3';
import * as ethers from 'ethers';
import { environment } from '../../environments/environment';

import * as University from '../../../build/contracts/University.json';
import { Student } from 'src/models/student.model';
import {GenericUser} from "../../models/genericUser.model";

declare let window: any;
declare let ethereum: any;

@Injectable({
  providedIn: 'root',
})
export class PortisService {
  public provider: any;
  public universityContractInstance: any;
  public networkName: any;

  public universityName: any;

  public email: any;
  public loginAddress: any;
  public students: Student[] = [];

  portis = new Portis('211b48db-e8cc-4b68-82ad-bf781727ea9e', 'ropsten', {
    scope: ['email'],
  });

  constructor() {
    //this.initEthers();
  }

  async initPortis() {
    this.provider = new ethers.providers.Web3Provider(this.portis.provider);
    await this.portis.provider.enable();
    this.networkName = await this.provider.getNetwork();
    const accounts = await this.provider.listAccounts();
    if ((accounts[0] = '')) {
      console.warn('Not Connected!');
      return false;
    } else {
      console.log('Connected with Portis!');
      return true;
    }
  }

  async getAddress() {
    const accounts = await this.provider.listAccounts();
    return accounts[0];
  }

  async conectUniversity() {
    if (!environment.universityAddress)
      throw new Error('invalid contract address!');
    if (!University || !University.abi)
      throw new Error('invalid contract json, try to run truffle compile!');
    if (this.portis.provider) {
      const signer = this.provider.getSigner();
      this.universityContractInstance = new ethers.Contract(
        environment.universityAddress,
        University.abi,
        signer
      );
      this.universityName = await this.universityContractInstance.name();
    } else {
      console.warn('try to connect with portis!');
      this.provider = new ethers.providers.JsonRpcProvider(
        'http://localhost:8545'
      );
    }
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

  public async getUniversityOwner() {
    const owner = await this.universityContractInstance.owner();
    return owner;
  }

  public async changeUniversityName(_newName: string) {
    const newName = ethers.utils.formatBytes32String(_newName);
    await this.universityContractInstance.set(newName);
    console.log(newName);
    return newName;
  }

  public async listRoles(role: string) {
    let list: Array<GenericUser> = [];
    const roleBytes = (role == 'DEFAULT_ADMIN_ROLE') ? ethers.utils.formatBytes32String('') : ethers.utils.solidityKeccak256(["string"], [role]);
    const size = await this.universityContractInstance.getRoleMemberCount(roleBytes);
    let index = 0;
    while (index < size){
      const member = await this.universityContractInstance.getRoleMember(roleBytes, index);
      list.push(new GenericUser(index, member));
      index++;
    }
  }

  public async studentSelfRegister(_name: string) {
    const name = ethers.utils.formatBytes32String(_name);
    const register = await this.universityContractInstance.studentSelfRegister(name);
    console.log(register);
    return register;
  }

  async revokeRole(role: string, address: string) {
    if (role == 'DEFAULT_ADMIN_ROLE') return;
    const roleBytes = ethers.utils.solidityKeccak256(["string"], [role]);
    await this.universityContractInstance.revokeRole(roleBytes, address);
  }

  async grantRole(role: string, address: string) {
    const roleBytes = (role == 'DEFAULT_ADMIN_ROLE') ? ethers.utils.formatBytes32String('') : ethers.utils.solidityKeccak256(["string"], [role]);
    await this.universityContractInstance.grantRole(roleBytes, address);
  }

}
