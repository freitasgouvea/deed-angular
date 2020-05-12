export class Classroom {
    constructor(
        public id: Number,
        public title: String,
        public smartcontract: String,
        public startDate: String,
        public finishDate: String,
        public price: Number,
        public open: Boolean,
        public close: Boolean,
        public done: Boolean
    ) {}

}