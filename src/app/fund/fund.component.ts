import { Component, OnInit } from '@angular/core';
import { Globals } from '../app.globals';
import { InfuraService } from '../services/infura.service';

@Component({
	selector: 'fund',
	templateUrl: './fund.component.html',
	styleUrls: ['./fund.component.css'],
})
export class FundComponent implements OnInit {
	constructor(public globals: Globals) {}

	userIsFundManager = false;

	assetsData = {
		DAI: 0,
		ETH: 0,
		USDC: 0,
		TUSD: 0,
		USDT: 0,
		BUSD: 0,
		LEND: 0,
		BAT: 0,
		KNC: 0,
		LINK: 0,
		MANA: 0,
		MKR: 0,
		REP: 0,
		WBTC: 0,
		ZRX: 0,
	}

	investmentData = {
		'Compound DAI': 0,
		'Aave DAI': 0,
	};

	investmentResultsData = {
		'Compound Underlying DAI': 0,
		'Aave Underlying DAI': 0,
	};

	compoundColateral = 0;

	compoundBorrowData = {
		'Borrowed DAI': 0,
		'Borrowed ETH': 0,
		'Borrowed USDC': 0,
		'Borrowed TUSD': 0,
		'Borrowed USDT': 0,
		'Borrowed BUSD': 0,
		'Borrowed LEND': 0,
		'Borrowed BAT': 0,
		'Borrowed KNC': 0,
		'Borrowed LINK': 0,
		'Borrowed MANA': 0,
		'Borrowed MKR': 0,
		'Borrowed REP': 0,
		'Borrowed WBTC': 0,
		'Borrowed ZRX': 0,
	}

	aaveColateral = 0;

	aaveBorrowData = {
		'Borrowed DAI': 0,
		'Borrowed ETH': 0,
		'Borrowed USDC': 0,
		'Borrowed TUSD': 0,
		'Borrowed USDT': 0,
		'Borrowed BUSD': 0,
		'Borrowed LEND': 0,
		'Borrowed BAT': 0,
		'Borrowed KNC': 0,
		'Borrowed LINK': 0,
		'Borrowed MANA': 0,
		'Borrowed MKR': 0,
		'Borrowed REP': 0,
		'Borrowed WBTC': 0,
		'Borrowed ZRX': 0,
	}

	uniswapData = {
		'ETH-DAI pair': 0,
		'DAI-USDC pair': 0,
		'DAI-TUSD pair': 0,
		'DAI-USDT pair': 0,
		'DAI-BUSD pair': 0,
		'DAI-LEND pair': 0,
		'DAI-BAT pair': 0,
		'DAI-KNC pair': 0,
		'DAI-LINK pair': 0,
		'DAI-MANA pair': 0,
		'DAI-MKR pair': 0,
		'DAI-REP pair': 0,
		'DAI-WBTC pair': 0,
		'DAI-ZRX pair': 0,
	}

	ngOnInit(): void {
		if (!this.globals.service) {
			this.globals.service = new InfuraService();
			this.globals.ensService.configureProvider(
				this.globals.service.provider,
				false
			);
			console.log('Connected to infura');
		}
		this.delay(1000).then(() => this.refreshInfo());
	}

	delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}

	refreshInfo(){
		this.getRoleMembers('FUNDS_MANAGER_ROLE').then((result) => {
			if (
				result &&
				result.find(
					(element) => element.address == this.globals.address
				)
			)
				this.userIsFundManager = true;
		});
	}

	async getRoleMembers(role: string) {
		return await this.globals.service.listRoles(role, this.globals.service.universityFundContractInstance);
	}

	sendToken(identifier: string, value: string){}

	deposit(identifier: string, value: string){}

	redeem(identifier: string, value: string){}

	enterMarket(identifier: string){}

	exitMarket(identifier: string){}

	borrow(identifier: string, value: string){}

	repay(identifier: string, value: string){}

	provide(identifier: string, value: string){}

	remove(identifier: string, value: string){}
}
