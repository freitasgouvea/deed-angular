import { Injectable } from '@angular/core';
import Portis from '@portis/web3';
import Web3 from 'web3';
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

  private provider: any;
  private contractInstance: any;
  public email: any;
  public loginAddress: any;
  public students: Student[] = [];
  portis = new Portis("211b48db-e8cc-4b68-82ad-bf781727ea9e", "rinkeby", {
    scope: ["email"]
  });

  constructor() {
    //this.initEthers();
  }

  async initPortis() {
    const web3 = new Web3(this.portis.provider);
    await this.portis.provider.enable();
    const accounts = await web3.eth.getAccounts();
    web3.eth.getAccounts((error, accounts) => {
      console.log(accounts);
    });
    console.log(this.loginAddress, this.email);
    if (accounts[0] = '') {
      console.warn('Not Connected!');
      return false
    } 
    else {
      console.warn('Connected with Portis!');
      return true
    }
  }

  async getAddress() {
    const web3 = new Web3(this.portis.provider);
    web3.eth.getAccounts((error, accounts) => {
      console.log(accounts);
      return accounts
    });
  }

  private conectUniversity() {
    if (!environment.universityAddress)
      throw new Error('invalid contract address!');
    if (!University || !University.abi)
      throw new Error('invalid contract json, try to run truffle compile!');
    if (window.ethereum) {
      this.portis.provider = new ethers.providers.Web3Provider(window.ethereum);
      window.ethereum.enable().then(() => {
        const signer = this.portis.provider.getSigner();
        const deploymentKey = Object.keys(University.networks)[0];
        const universityAddress = University
          .networks[deploymentKey]
          .address;
        this.contractInstance = new ethers.Contract(
          universityAddress,
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
    this.conectUniversity;
  }

  public async getUniversityName() {
    const name = this.contractInstance.name();
    console.log(name)
    return name;
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
