import { shuffleEventPile } from "./Helpers";
import {
  Elephant,
  EventCard,
  EventType,
  Presidency,
  Region,
  RegionName,
  RegionStatus,
  Scenario,
  RegionSymbol,
  StormDieFace,
  SeaZone,
} from "./Types";

export const getRegionData = (scenario: Scenario) => {
  switch (scenario) {
    case Scenario.SeventeenTen:
      return SeventeenTenRegions;
    default:
      return SeventeenTenRegions;
      break;
  }
};

export const getElephantInitialPosition = (scenario: Scenario): Elephant => {
  switch (scenario) {
    case Scenario.SeventeenTen:
      return {
        MainRegion: RegionName.Maratha,
        TargetRegion: RegionName.Delhi,
      };
    case Scenario.SeventeenFiftyEight:
      return {
        MainRegion: RegionName.Delhi,
        TargetRegion: RegionName.Bengal,
      };
    case Scenario.EighteenThirteen:
      return {
        MainRegion: RegionName.Mysore,
        TargetRegion: RegionName.Madras,
      };
  }
};

export const getInitialEventDeck = () => {
  return shuffleEventPile(EventDeck);
};

export const StormDie: StormDieFace[] = [
  { Sea: SeaZone.EastSea, EventNumber: 2 } as StormDieFace,
  { Sea: SeaZone.WestSea, EventNumber: 2 } as StormDieFace,
  { Sea: SeaZone.SouthSea, EventNumber: 3 } as StormDieFace,
  { Sea: SeaZone.All, EventNumber: 1 } as StormDieFace,
  { Sea: SeaZone.None, EventNumber: 4 } as StormDieFace,
  { Sea: SeaZone.None, EventNumber: 4 } as StormDieFace,
];

export const punjab = {
  id: RegionName.Punjab,
  index: 0,
  status: RegionStatus.Sovereign,
  dominator: undefined,
  towerLevel: 0,
  lootAvailable: true,
  lootAmount: 6,
  unrest: 0,
  neighbors: [
    {
      regionId: RegionName.Delhi,
      symbol: [RegionSymbol.Square],
    },
    {
      regionId: RegionName.Bombay,
      symbol: [RegionSymbol.Circle, RegionSymbol.Triangle],
    },
  ],
};
export const delhi: Region = {
  id: RegionName.Delhi,
  index: 1,
  status: RegionStatus.Sovereign,
  towerLevel: 0,
  lootAvailable: true,
  lootAmount: 8,
  unrest: 0,
  neighbors: [
    {
      regionId: RegionName.Bengal,
      symbol: [RegionSymbol.Triangle],
    },
    {
      regionId: RegionName.Maratha,
      symbol: [RegionSymbol.Circle],
    },
    {
      regionId: RegionName.Bombay,
      symbol: [],
    },
    {
      regionId: RegionName.Punjab,
      symbol: [RegionSymbol.Square],
    },
  ],
};
export const bengal: Region = {
  id: RegionName.Bengal,
  index: 2,
  status: RegionStatus.Sovereign,
  controllingPresidency: undefined,
  towerLevel: 0,
  lootAvailable: true,
  lootAmount: 6,
  unrest: 0,
  neighbors: [
    {
      regionId: RegionName.Maratha,
      symbol: [RegionSymbol.Circle],
    },
    {
      regionId: RegionName.Delhi,
      symbol: [RegionSymbol.Square, RegionSymbol.Triangle],
    },
  ],
};

export const bombay: Region = {
  id: RegionName.Bombay,
  index: 3,
  status: RegionStatus.Sovereign,
  towerLevel: 0,
  lootAvailable: true,
  lootAmount: 4,
  unrest: 0,
  neighbors: [
    {
      regionId: RegionName.Punjab,
      symbol: [RegionSymbol.Triangle],
    },
    {
      regionId: RegionName.Delhi,
      symbol: [],
    },
    {
      regionId: RegionName.Maratha,
      symbol: [RegionSymbol.Circle],
    },
    {
      regionId: RegionName.Hyderabad,
      symbol: [RegionSymbol.Square],
    },
    {
      regionId: RegionName.Mysore,
      symbol: [],
    },
  ],
};
export const maratha: Region = {
  id: RegionName.Maratha,
  index: 4,
  status: RegionStatus.Sovereign,
  towerLevel: 0,
  lootAvailable: true,
  lootAmount: 3,
  unrest: 0,
  neighbors: [
    {
      regionId: RegionName.Bombay,
      symbol: [RegionSymbol.Circle],
    },
    {
      regionId: RegionName.Delhi,
      symbol: [RegionSymbol.Square],
    },
    {
      regionId: RegionName.Bengal,
      symbol: [RegionSymbol.Triangle],
    },
    {
      regionId: RegionName.Hyderabad,
      symbol: [],
    },
  ],
};
export const hyderabad: Region = {
  id: RegionName.Hyderabad,
  index: 5,
  status: RegionStatus.Sovereign,
  towerLevel: 0,
  lootAvailable: true,
  lootAmount: 7,
  unrest: 0,
  neighbors: [
    {
      regionId: RegionName.Bombay,
      symbol: [RegionSymbol.Square],
    },
    {
      regionId: RegionName.Maratha,
      symbol: [RegionSymbol.Triangle],
    },
    {
      regionId: RegionName.Madras,
      symbol: [RegionSymbol.Circle],
    },
    {
      regionId: RegionName.Mysore,
      symbol: [],
    },
  ],
};
export const mysore: Region = {
  id: RegionName.Mysore,
  index: 6,
  status: RegionStatus.Sovereign,
  towerLevel: 0,
  lootAvailable: true,
  lootAmount: 5,
  unrest: 0,
  neighbors: [
    {
      regionId: RegionName.Bombay,
      symbol: [RegionSymbol.Circle],
    },
    {
      regionId: RegionName.Hyderabad,
      symbol: [RegionSymbol.Triangle],
    },
    {
      regionId: RegionName.Madras,
      symbol: [RegionSymbol.Square],
    },
  ],
};
export const madras: Region = {
  id: RegionName.Madras,
  index: 7,
  status: RegionStatus.Sovereign,
  towerLevel: 0,
  lootAvailable: true,
  lootAmount: 5,
  unrest: 0,
  neighbors: [
    {
      regionId: RegionName.Mysore,
      symbol: [RegionSymbol.Triangle, RegionSymbol.Square],
    },
    {
      regionId: RegionName.Hyderabad,
      symbol: [RegionSymbol.Circle],
    },
  ],
};

export const SeventeenTenRegions: Region[] = [
  {
    ...punjab,
    status: RegionStatus.Dominated,
    dominator: RegionName.Delhi,
  },
  {
    ...delhi,
    status: RegionStatus.EmpireCapital,
    towerLevel: 1,
  },
  {
    ...bengal,
    towerLevel: 1,
  },
  {
    ...bombay,
    towerLevel: 1,
  },
  {
    ...maratha,
    status: RegionStatus.Dominated,
    dominator: RegionName.Delhi,
    towerLevel: 2,
  },
  {
    ...hyderabad,
    towerLevel: 1,
  },
  {
    ...mysore,
    towerLevel: 1,
  },
  {
    ...madras,
    towerLevel: 1,
  },
];

export const SeventeenFiftyEightRegions: Region[] = [
  {
    ...punjab,
    status: RegionStatus.Dominated,
    dominator: RegionName.Delhi,
    towerLevel: 1,
  },
  {
    ...delhi,
    status: RegionStatus.EmpireCapital,
    towerLevel: 1,
  },
  {
    ...bengal,
    status: RegionStatus.CompanyControlled,
    controllingPresidency: Presidency.BengalPresidency,
    lootAvailable: false,
  },
  {
    ...bombay,
    towerLevel: 2,
  },
  {
    ...maratha,
    towerLevel: 2,
  },
  {
    ...hyderabad,
    towerLevel: 1,
  },
  {
    ...mysore,
    towerLevel: 2,
  },
  {
    ...madras,
    towerLevel: 1,
  },
];

export const EighteenThirteenRegions: Region[] = [
  {
    ...punjab,
    towerLevel: 2,
  },
  {
    ...delhi,
    towerLevel: 1,
  },
  {
    ...bengal,
    status: RegionStatus.CompanyControlled,
    lootAvailable: false,
    controllingPresidency: Presidency.BengalPresidency,
  },
  {
    ...bombay,
    status: RegionStatus.CompanyControlled,
    controllingPresidency: Presidency.BombayPresidency,
    lootAvailable: false,
  },
  {
    ...maratha,
    towerLevel: 2,
  },
  {
    ...hyderabad,
    towerLevel: 1,
  },
  {
    ...mysore,
    towerLevel: 2,
  },
  {
    ...madras,
    status: RegionStatus.CompanyControlled,
    controllingPresidency: Presidency.MadrasPresidency,
    lootAvailable: false,
  },
];

export const EventDeck: EventCard[] = [
  {
    id: "foreign-invasion",
    type: EventType.ForeignInvasion,
    strength: 0,
    symbol: RegionSymbol.Circle,
    Region: RegionName.Maratha,
    Description:
      "Roll storm die and resolve an Invasion in each region linked to a storm. If none, use top event card.) For each, roll a die to determine strength. If this region falls, close every order there and set its strength to half of the die roll (round down)",
  },
  {
    id: "shuffle",
    type: EventType.Shuffle,
    strength: 0,
    symbol: RegionSymbol.Circle,
    Region: RegionName.Madras,
    Description:
      "Shuffle this tile in with the deck. Then shuffle the discards and place them on top.",
  },
  {
    id: "leader-1",
    type: EventType.Leader,
    strength: 3,
    symbol: RegionSymbol.Circle,
    Region: RegionName.Punjab,
    Description: "",
  },
  {
    id: "leader-2",
    type: EventType.Leader,
    strength: 2,
    symbol: RegionSymbol.Square,
    Region: RegionName.Bombay,
    Description: "",
  },
  {
    id: "leader-3",
    type: EventType.Leader,
    strength: 4,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Hyderabad,
    Description: "",
  },
  {
    id: "leader-4",
    type: EventType.Leader,
    strength: 2,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Bengal,
    Description: "",
  },
  {
    id: "peace-1",
    type: EventType.Peace,
    strength: 0,
    symbol: RegionSymbol.Square,
    Region: RegionName.Mysore,
    Description: "",
  },
  {
    id: "peace-2",
    type: EventType.Peace,
    strength: 0,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Madras,
    Description: "",
  },
  {
    id: "windfall-1",
    type: EventType.Windfall,
    strength: 0,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Hyderabad,
    Description: "Gain 1£ for writers here and in adjacent regions.",
  },
  {
    id: "windfall-2",
    type: EventType.Windfall,
    strength: 0,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Madras,
    Description: "Gain 1£ for writers here and in adjacent regions.",
  },
  {
    id: "turmoil-1",
    type: EventType.Turmoil,
    strength: 0,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Delhi,
    Description:
      "Close northernmost open order. If all are closed, perform Cascade (close orders in connected regions).",
  },
  {
    id: "turmoil-2",
    type: EventType.Turmoil,
    strength: 0,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Punjab,
    Description:
      "Close northernmost open order. If all are closed, perform Cascade (close orders in connected regions).",
  },
  {
    id: "turmoil-3",
    type: EventType.Turmoil,
    strength: 0,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Maratha,
    Description:
      "Close northernmost open order. If all are closed, perform Cascade (close orders in connected regions).",
  },
  {
    id: "turmoil-4",
    type: EventType.Turmoil,
    strength: 0,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Bombay,
    Description:
      "Close northernmost open order. If all are closed, perform Cascade (close orders in connected regions).",
  },
  {
    id: "resolve-crisis-1",
    type: EventType.ResolveCrisis,
    strength: 0,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Delhi,
    Description: "",
  },
  {
    id: "resolve-crisis-2",
    type: EventType.ResolveCrisis,
    strength: -1,
    symbol: RegionSymbol.Circle,
    Region: RegionName.Punjab,
    Description: "",
  },
  {
    id: "resolve-crisis-3",
    type: EventType.ResolveCrisis,
    strength: 3,
    symbol: RegionSymbol.Circle,
    Region: RegionName.Maratha,
    Description: "",
  },
  {
    id: "resolve-crisis-4",
    type: EventType.ResolveCrisis,
    strength: 1,
    symbol: RegionSymbol.Square,
    Region: RegionName.Bombay,
    Description: "",
  },
  {
    id: "resolve-crisis-5",
    type: EventType.ResolveCrisis,
    strength: 1,
    symbol: RegionSymbol.Triangle,
    Region: RegionName.Bengal,
    Description: "",
  },
  {
    id: "resolve-crisis-6",
    type: EventType.ResolveCrisis,
    strength: 2,
    symbol: RegionSymbol.Square,
    Region: RegionName.Mysore,
    Description: "",
  },
];
