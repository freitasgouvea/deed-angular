import { Injectable } from '@angular/core';
import Portis from '@portis/web3';
//import Web3 from 'web3';
import * as ethers from 'ethers';
import { environment } from '../../environments/environment';

import * as University from '../../../build/contracts/University.json';
import { Student } from 'src/models/student.model';
import { baseClientService } from './baseClient.service';

declare let window: any;
declare let ethereum: any;

@Injectable({
	providedIn: 'root',
})
export class ENSService {
	constructor() {}

	public getTxRecord(node, key): String {
		return 'TODO ' + key;
		//TODO:
		//return ENS.text(node, key);
	}

	public getTxEmail(node): String {
		return this.getTxRecord(node, 'email');
	}

	public getTxURL(node): String {
		return this.getTxRecord(node, 'url');
	}

	public getTxAvatar(node): String {
		return this.getTxRecord(node, 'avatar');
	}

	public getTxDescription(node): String {
		return this.getTxRecord(node, 'description');
	}

	public getTxNotice(node): String {
		return this.getTxRecord(node, 'notice');
	}

	public getTxKeywordsString(node): String {
		return this.getTxRecord(node, 'keywords');
	}

	public getTxKeywordsArray(node): Array<String> {
		return this.getTxKeywordsString(node).split(',');
	}

	public getNodeFromAddress(address) {
		//TODO:
	}
}
