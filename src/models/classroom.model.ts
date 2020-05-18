export class Classroom {
	public startDate: Date;
	public finishDate: Date;
	public startDate_StringDate: string;
	public finishDate_StringDate: string;
	public startDate_String: string;
	public finishDate_String: string;
	dateStringOptions = { year: 'numeric', month: 'long', day: 'numeric' };
	public metadata = {email: '', url: '', avatar: '', description: '', notice: '', keywords: new Array<string>()}
	public classdata = {students: 0, validStudents: 0, funds: 0, fundsInvested:0, investmentReturns:0}
	public params = {compoundApplyPercentage: 0.5}

    constructor(
        public id: number,
        public title: string,
        public smartcontract: string,
        public startDateTimestamp: number,
        public finishDateTimestamp: number,
        public duration: number,
        public price: number,
        public minScore: number,
        public cutPrincipal: number,
        public cutPool: number,
		public openForApplication: Boolean,
		public courseEmpty: Boolean,
        public classroomActive: Boolean,
        public courseFinished: Boolean,
		public addressChallenge: string,
		public owner: string
	) {
		this.startDate = new Date(this.startDateTimestamp * 1000);
		this.finishDate = new Date(this.finishDateTimestamp * 1000);
		this.startDate_StringDate = this.startDate.toLocaleDateString('en-US', this.dateStringOptions);
		this.finishDate_StringDate = this.finishDate.toLocaleDateString('en-US', this.dateStringOptions);
		this.startDate_String = this.startDate.toUTCString();
		this.finishDate_String = this.finishDate.toUTCString();
	}

	public isClassroomActive(): Boolean{
		return this.state() === 3;
	}

	public isClassroomClosed(): Boolean{
		return this.state() === 2;
	}

	public isClassroomOpen(): Boolean{
		return this.state() === 1;
	}

	public isClassroomNotOpen(): Boolean{
		return this.state() === 0;
	}

	public state(): number {
		if (this.courseFinished) return 4;
		if (this.classroomActive) return 3;
		if (!this.openForApplication && !this.courseEmpty) return 2;
		if (this.openForApplication && this.courseEmpty) return 1;
		return 0;
	}

}
