export class Classroom {
    constructor(
        public id: Number,
        public title: String,
        public smartcontract: String,
        public startDate: String,
        public finishDate: String,
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
	) {}

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
