export class Student {
    public hasApplications = false;
    constructor(
        public address: string,
        public name: string,
        public score: string,
        public smartContractAddress: string,
        public applications: []
    ) {}
    }