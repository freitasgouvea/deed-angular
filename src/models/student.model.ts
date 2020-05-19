export class Student {
    public hasApplications = false;
    constructor(
        public address: String,
        public name: String,
        public score: String,
        public smartContractAddress: String,
        public applications: []
    ) {}
    }