export class Classroom {
	public startDate: Date;
	public finishDate: Date;
	public startDate_StringDate: string;
	public finishDate_StringDate: string;
	public startDate_String: string;
	public finishDate_String: string;
	dateStringOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    constructor(
        public id: Number,
        public title: String,
        public smartcontract: String,
        public startDateTimestamp: number,
        public finishDateTimestamp: number,
        public duration: Number,
        public price: Number,
        public minScore: number,
        public cutPrincipal: Number,
        public cutPool: Number,
		public openForApplication: Boolean,
		public courseEmpty: Boolean,
        public classroomActive: Boolean,
        public courseFinished: Boolean,
		public addressChallenge: String,
		public owner: String
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

	public state(): Number {
		if (this.courseFinished) return 4;
		if (this.classroomActive) return 3;
		if (!this.openForApplication && !this.courseEmpty) return 2;
		if (this.openForApplication && this.courseEmpty) return 1;
		return 0;
	}

}
