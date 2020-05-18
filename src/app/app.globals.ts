import { Injectable } from '@angular/core';
import { PortisService } from './services/portis.service';
import { InfuraService } from './services/infura.service';
import { Classroom } from 'src/models/classroom.model';
import { ENSService } from './services/ens.service';
import { Student } from 'src/models/student.model';

@Injectable()
export class Globals {
	public service: PortisService | InfuraService;
	public ensService = new ENSService();
	public address: string;
	public mode = 'unconnected';
	public userIsStudent = false;
	public userIsUniversityAdmin = false;
	public userIsClassroomAdmin = false;
	public selectedClassroom: Classroom;
	public selectedStudent: Student;
	public classrooms = new Array<Classroom>();
	public universityInfoNeedsRefresh = true;
	public universityENSNameRecord = false;
	public universityENSHasNotice = false;
	public universityDisplayNotice = true;
	public pageParalelRefreshLock = false;
	public classlistLoaded = false;
	public universityENSDescription = 'Loading...';

	public universityName: any;
	public universityENSName: any;
	public universityENSTTL: any;
	public universityENSNotice: any;
	public universityCut: any;
	public universityFunds: any;
	public universityBudget: any;
	public universityDonations: any;
	public universityRevenue: any;
	public universityReturns: any;
	public universityAdmin: any;
	public universityParams: any;
}