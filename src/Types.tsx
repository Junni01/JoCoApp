export enum RegionName {
  Punjab = "Punjab",
  Delhi = "Delhi",
  Bombay = "Bombay",
  Maratha = "Maratha",
  Bengal = "Bengal",
  Hyderabad = "Hyderabad",
  Madras = "Madras",
  Mysore = "Mysore",
}

export enum Presidency {
  MadrasPresidency = "Madras Presidency",
  BengalPresidency = "Bengal Presidency",
  BombayPresidency = "Bombay Presidency",
}

export enum RegionStatus {
  Sovereign = "Sovereign",
  Dominated = "Dominated",
  EmpireCapital = "Empire Capital",
  CompanyControlled = "Company Controlled",
}

export enum DeployType {
  CompanyControlledWithUnrest,
  CompanyControlledWithoutUnrest,
  Sovereign,
  Dominated,
  EmpireCapital,
}

export enum CrisisType {
  SovereignInvadesSovereign,
  SovereignInvadesDominated,
  SovereignInvadesEmpireCapital,
  EmpireInvadesSovereign,
  DominatedRebelsAgainstEmpire,
  SovereignInvadesCompany,
  EmpireInvadesCompany,
  CompanyControlledRebels,
}

export enum RegionSymbol {
  Square = "Square",
  Circle = "Circle",
  Triangle = "Triangle",
}

export type Neighbor = {
  regionId: RegionName;
  symbol: RegionSymbol[];
};

export type Region = {
  id: RegionName;
  index: number;
  status: RegionStatus;
  neighbors: Neighbor[];
  towerLevel: number;
  dominator?: RegionName;
  controllingPresidency?: Presidency;
  lootAvailable: boolean;
  lootAmount: number;
  unrest: number;
};

export type Elephant = {
  MainRegion: RegionName;
  TargetRegion?: RegionName;
};

export enum Scenario {
  SeventeenTen = "SeventeenTen",
  SeventeenFiftyEight = "SeventeenFiftyEight",
  EighteenThirteen = "EighteenThirteen",
}

export enum EventType {
  ResolveCrisis = "Resolve Crisis",
  Windfall = "Windfall",
  Turmoil = "Turmoil",
  Leader = "Leader",
  Peace = "Peace",
  Shuffle = "Shuffle",
  ForeignInvasion = "Foreign Invasion",
}

export type EventCard = {
  id: string;
  type: EventType;
  strength: number;
  symbol: RegionSymbol;
  Region: RegionName;
  Description: string;
};

export enum SeaZone {
  WestSea = "West Sea",
  SouthSea = "South Sea",
  EastSea = "East Sea",
  None = "None",
  All = "All",
}

export type StormDieFace = {
  Sea: SeaZone;
  EventNumber: number;
};
