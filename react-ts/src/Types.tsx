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

export enum Symbol {
  Square = "Square",
  Circle = "Circle",
  Triangle = "Triangle",
}

export type Neighbor = {
  regionId: RegionName;
  symbol: Symbol[];
};

export type Region = {
  id: RegionName;
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
  symbol: Symbol;
  Region: RegionName;
  Description: string;
};
