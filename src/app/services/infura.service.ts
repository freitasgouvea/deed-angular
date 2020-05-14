import { Injectable } from '@angular/core';
//import Web3 from 'web3';
import * as ethers from 'ethers';
import { environment } from '../../environments/environment';

import * as University from '../../../build/contracts/University.json';
import { Student } from 'src/models/student.model';

declare let window: any;
declare let ethereum: any;

@Injectable({
  providedIn: 'root',
})
export class InfuraService {
  public provider: any;
  public universityContractInstance: any;
  public networkName: any;

  constructor() {
    this.provider = new ethers.providers.InfuraProvider(
      environment.network,
      environment.infuraKey
    );
    this.universityContractInstance = new ethers.Contract(
      environment.universityAddress,
      University.abi,
      this.provider
    );
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
}
