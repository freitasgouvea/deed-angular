import { Injectable } from '@angular/core';
import Portis from '@portis/web3';
//import Web3 from 'web3';
import * as ethers from 'ethers'
import { environment } from '../../environments/environment';

import * as University from '../../../build/contracts/University.json';
import { Student } from 'src/models/student.model';

declare let window: any;
declare let ethereum: any;


@Injectable({
  providedIn: 'root'
})
export class PortisService {

  public provider: any;
  public contractInstance: any;
  public networkName: any;

  public universityName: any;

  public email: any;
  public loginAddress: any;
  public students: Student[] = [];

  portis = new Portis("211b48db-e8cc-4b68-82ad-bf781727ea9e", "ropsten", {
    scope: ["email"]
  });

  constructor() {
    //this.initEthers();
  }

  async initPortis() {
    this.provider = new ethers.providers.Web3Provider(this.portis.provider);
    await this.portis.provider.enable();
    this.networkName = await this.provider.network.name;
    const accounts = await this.provider.listAccounts();
    console.log(accounts[0], this.networkName);
    if (accounts[0] = '') {
      console.warn('Not Connected!');
      return false
    }
    else {
      console.log('Connected with Portis!');
      return true
    }
  }

  async getAddress() {
    const accounts = await this.provider.listAccounts();
    console.log(accounts[0]);
    return accounts[0];
  }

  async conectUniversity() {
    if (!environment.universityAddress)
      throw new Error('invalid contract address!');
    if (!University || !University.abi)
      throw new Error('invalid contract json, try to run truffle compile!');
    if (this.portis.provider) {
      const signer = this.provider.getSigner();
      this.contractInstance = new ethers.Contract(
        environment.universityAddress,
        University.abi,
        signer
      );
      console.log(this.contractInstance);
      this.universityName = await this.contractInstance.name();
      console.log('conected to University ' + this.universityName );
    } else {
      console.warn('try to connect with portis!');
      this.provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    }
  }

  public async getUniversityName() {
    const name = this.contractInstance.name();
    console.log(name)
    return name;
  }

  public async getUniversityOwner() {
    const owner = this.contractInstance.owner();
    console.log(owner)
    return owner;
  }

  public async changeUniversityName(_newName: string) {
    const newName = ethers.utils.formatBytes32String(_newName);
    await this.contractInstance.set(newName);
    console.log(newName);
    return newName;
  }

  /*

  //TODO: receber o email para o registro

      this.portis.onLogin((walletAddress, email) => {
      this.email = email;
      this.loginAddress = walletAddress;
    });

  

    async initPortis() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    await this.portis.provider.enable().then(() => {
      this.loginAddress = this.provider.getSigner()
      console.log(this.loginAddress);
    });
    if (this.loginAddress = '') {
      console.warn('Not Connected!');
      return false
    } 
    else {
      console.warn('Connected with Portis!');
      return true
    }
  }

  //TODO: Conect with University Smart Contract
  //TODO: Conect with Student Factory Smart Contract
  //TODO: Conect with Classroom Factory Smart Contract

  EXAMPLE:

    private initEthers() {
      if (!environment.contractAddress)
        throw new Error('invalid contract address!');
      if (!University || !University.abi)
        throw new Error('invalid contract json, try to run truffle compile!');
      if (window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        window.ethereum.enable().then(() => {
          const signer = this.provider.getSigner();
          const deploymentKey = Object.keys(University.networks)[0];
          const contractAddress = University
            .networks[deploymentKey]
            .address;
          this.contractInstance = new ethers.Contract(
            contractAddress,
            University.abi,
            signer
          );
          ethereum.on('accountsChanged', this.callbackAccountChanged);
        });
      } else {
        console.warn('try to use Metamask!');
        this.provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
      }
    }
    private callbackAccountChanged() {
      this.initEthers;
  }

  public async set(value: string) {
    this.contractInstance.set(value);
  }
  public async get() {
    return this.contractInstance.get();
  }
    */

}
