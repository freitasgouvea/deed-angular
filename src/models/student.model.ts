export class Student {

	public metadata = {
		ENSName: '',
		email: '',
		url: '',
		avatar: '',
		description: '',
		notice: '',
		keywords: new Array<string>(),
	};

	public studentENSNameRecord = false;

    public hasApplications = false;
	public address: string;
	public name: string;
	public score: string;
	public smartContractAddress: string;
	public applications: []
    constructor(
    ) {}
    }
