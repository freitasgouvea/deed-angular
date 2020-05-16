export class Classroom {
    constructor(
        public id: Number,
        public title: String,
        public smartcontract: String,
        public startDate: String,
        public finishDate: String,
        public price: Number,
        public minScore: number,
        public cutPrincipal: Number,
        public cutPool: Number,
        public openForApplication: Boolean,
        public classroomActive: Boolean,
        public courseFinished: Boolean,
		public addressChallenge: String,
		public owner: String
    ) {}

}
