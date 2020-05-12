import { Injectable } from '@angular/core';
import Web3 from 'web3';
//import * as ethers from 'ethers'
//import { environment } from '../../environments/environment';
//import * as University from '../../../build/contracts/University.json';

declare let window: any;
declare let ethereum: any;

@Injectable({
  providedIn: 'root'
})
export class PortisService {

  private provider: any;
  private contractInstance: any;

  constructor() {
    //this.initEthers();
  }

  async initPortis() {
    const portis = new Portis("24362e3c-2da0-445c-a0ee-b1e33da455ce", "rinkeby");
    const web3 = new Web3(portis.provider);
    await portis.provider.enable();
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] = '') {
      return false
    } 
    else {
      return true
    }
  }

  /*
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
    */
  public async set(value: string) {
    this.contractInstance.set(value);
  }
  public async get() {
    return this.contractInstance.get();
  }
}
