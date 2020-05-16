import { Injectable } from '@angular/core';
//import Web3 from 'web3';
import * as ethers from 'ethers';
import { environment } from '../../environments/environment';
import { baseClientService } from './baseClient.service';

declare let window: any;
declare let ethereum: any;

@Injectable({
	providedIn: 'root',
})
export class InfuraService extends baseClientService {
	public networkName: any;

	constructor() {
		super();
		const provider = new ethers.providers.InfuraProvider(
			environment.network,
			environment.infuraKey
		);
		this.setupProvider(provider);
		this.connectContracts(this.provider);
	}
}
