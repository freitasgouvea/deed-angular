import { Injectable } from '@angular/core';
import Portis from '@portis/web3';
//import Web3 from 'web3';
import * as ethers from 'ethers';
import { environment } from '../../environments/environment';

import * as University from '../../../build/contracts/University.json';
import { Student } from 'src/models/student.model';
import {baseClientService} from './baseClient.service';

declare let window: any;
declare let ethereum: any;

@Injectable({
  providedIn: 'root',
})
export class PortisService extends baseClientService {
  public universityName: any;
  public account: any;

  public email: any;
  public loginAddress: any;
  public students: Student[] = [];

  portis = new Portis('211b48db-e8cc-4b68-82ad-bf781727ea9e', 'ropsten', {
    scope: ['email'],
  });

  constructor() {
    super();
  }

  async initPortis() {
    const provider = new ethers.providers.Web3Provider(this.portis.provider);
    await this.portis.provider.enable();
    this.setupProvider(provider);
    this.networkName = await this.provider.getNetwork();
    const address = await this.getAddress();
    if ((address === '')) {
      console.warn('Not Connected!');
      return false;
    } else {
      console.log('Connected with Portis!');
      return true;
    }
  }

  async getAddress() {
    const addresses = await this.provider.listAccounts();
    return addresses[0];
  }

  async conectUniversity() {
    if (!environment.universityAddress)
      throw new Error('invalid contract address!');
    if (!University || !University.abi)
      throw new Error('invalid contract json, try to run truffle compile!');
    if (this.portis.provider) {
      this.connectContracts(this.provider.getSigner());
      this.universityName = await this.universityContractInstance.name();
    } else {
      console.warn('try to connect with portis!');
      this.provider = new ethers.providers.JsonRpcProvider(
        'http://localhost:8545'
      );
    }
  }
  }
    return register;
    console.log(register);
    const register = await this.universityContractInstance.studentSelfRegister(name);
    const name = ethers.utils.formatBytes32String(_name);
  public async studentSelfRegister(_name: string) {

  }
    return newName;
    console.log(newName);
    await this.universityContractInstance.set(newName);
    const newName = ethers.utils.formatBytes32String(_newName);
  public async changeUniversityName(_newName: string) {

}
