import { Injectable } from '@angular/core';
import { PortisService } from './services/portis.service';
import { InfuraService } from './services/infura.service';

@Injectable()
export class Globals {
	public service: PortisService | InfuraService;
	public mode = 'unconnected';
	public userIsStudent = false;
	public userIsUniversityAdmin = false;
}
