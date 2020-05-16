import { Classroom } from './classroom.model';

export const CLASSROOMS: Classroom[] = [
  new Classroom( 1, "Learn Solidity", "smartcontract", "26th May 2020","23th July 2020",10, 400, 0, 0.2*1e2, 0.5*1e2, true, true, false, false, "NONE", ""),
  new Classroom( 2, "Learn Dapp", "smartcontract", "26th May 2020","23th July 2020",10, 300, 0, 0.2*1e2, 0.5*1e2, true, false, false, false, "NONE", ""),
  new Classroom( 3, "Learn Defi", "smartcontract", "26th May 2020","23th July 2020",10, 300, 0, 0.2*1e2, 0.5*1e2, true, false, false, false, "NONE", ""),
  new Classroom( 4, "Learn Ethereum", "smartcontract", "26th May 2020","23th July 2020",10, 500, 0, 0.2*1e2, 0.5*1e2, false, true, false, false, "NONE", ""),
  new Classroom( 5, "Learn Blockchain", "smartcontract", "26th May 2020","23th July 2020",10, 200, 0, 0.2*1e2, 0.5*1e2, false, false, false, false, "NONE", ""),
];
