import { Globals } from '../app/app.globals';

export class StudentApplication {
	public state = 0;
	public classroomAddress: string;

	constructor(
		public globals: Globals,
		public address: string,
		public studentAddress: string
	) {}

	public connectService() {
		this.globals.service.connectStudentApplication(this.address);
	}

	public isConnected() {
		if (!this.globals.service.studentApplicationContractInstance)
			return false;
		if (
			this.globals.service.studentApplicationContractInstance.address !=
			this.address
		)
			return false;
		return true;
	}

	public async updateState() {
		if (!this.isConnected()) throw 'Not connected';
	}
}
