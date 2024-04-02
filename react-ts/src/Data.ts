import {
  Elephant,
  EventCard,
  EventType,
  Presidency,
  Region,
  RegionName,
  RegionStatus,
  Scenario,
  Symbol,
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

export const getEventDeckData = () => {};

export const SeventeenTenRegions: Region[] = [
  {
    id: RegionName.Bengal,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 6,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square, Symbol.Triangle],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
    ],
  },
  {
    id: RegionName.Delhi,
    status: RegionStatus.EmpireCapital,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 8,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bengal,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Bombay,
        symbol: [],
      },
      {
        regionId: RegionName.Punjab,
        symbol: [Symbol.Square],
      },
    ],
  },
  {
    id: RegionName.Punjab,
    status: RegionStatus.Dominated,
    dominator: RegionName.Delhi,
    towerLevel: 0,
    lootAvailable: true,
    lootAmount: 6,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle, Symbol.Triangle],
      },
    ],
  },
  {
    id: RegionName.Bombay,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 4,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Punjab,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Delhi,
        symbol: [],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Maratha,
    status: RegionStatus.Dominated,
    dominator: RegionName.Delhi,
    towerLevel: 2,
    lootAvailable: true,
    lootAmount: 3,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Bengal,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Hyderabad,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 7,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Madras,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 5,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Mysore,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 5,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Square],
      },
    ],
  },
];

export const SeventeenFiftyEightRegions: Region[] = [
  {
    id: RegionName.Bengal,
    status: RegionStatus.CompanyControlled,
    controllingPresidency: Presidency.BengalPresidency,
    towerLevel: 0,
    lootAvailable: true,
    lootAmount: 6,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square, Symbol.Triangle],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
    ],
  },
  {
    id: RegionName.Delhi,
    status: RegionStatus.EmpireCapital,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 8,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bengal,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Bombay,
        symbol: [],
      },
      {
        regionId: RegionName.Punjab,
        symbol: [Symbol.Square],
      },
    ],
  },
  {
    id: RegionName.Punjab,
    status: RegionStatus.Dominated,
    dominator: RegionName.Delhi,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 6,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle, Symbol.Triangle],
      },
    ],
  },
  {
    id: RegionName.Bombay,
    status: RegionStatus.Sovereign,
    towerLevel: 2,
    lootAvailable: true,
    lootAmount: 4,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Punjab,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Delhi,
        symbol: [],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Maratha,
    status: RegionStatus.Sovereign,
    towerLevel: 2,
    lootAvailable: true,
    lootAmount: 3,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Bengal,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Hyderabad,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 7,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Madras,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 5,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Mysore,
    status: RegionStatus.Sovereign,
    towerLevel: 2,
    lootAvailable: true,
    lootAmount: 5,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Square],
      },
    ],
  },
];

export const EighteenThirteenRegions: Region[] = [
  {
    id: RegionName.Bengal,
    status: RegionStatus.CompanyControlled,
    controllingPresidency: Presidency.BengalPresidency,
    towerLevel: 0,
    lootAvailable: true,
    lootAmount: 6,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square, Symbol.Triangle],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
    ],
  },
  {
    id: RegionName.Delhi,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 8,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bengal,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Bombay,
        symbol: [],
      },
      {
        regionId: RegionName.Punjab,
        symbol: [Symbol.Square],
      },
    ],
  },
  {
    id: RegionName.Punjab,
    status: RegionStatus.Sovereign,
    towerLevel: 2,
    lootAvailable: true,
    lootAmount: 6,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle, Symbol.Triangle],
      },
    ],
  },
  {
    id: RegionName.Bombay,
    status: RegionStatus.CompanyControlled,
    controllingPresidency: Presidency.BombayPresidency,
    towerLevel: 0,
    lootAvailable: true,
    lootAmount: 4,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Punjab,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Delhi,
        symbol: [],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Maratha,
    status: RegionStatus.Sovereign,
    lootAvailable: true,
    lootAmount: 3,
    towerLevel: 2,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Delhi,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Bengal,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Hyderabad,
    status: RegionStatus.Sovereign,
    towerLevel: 1,
    lootAvailable: true,
    lootAmount: 7,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Madras,
    status: RegionStatus.CompanyControlled,
    controllingPresidency: Presidency.MadrasPresidency,
    lootAvailable: true,
    lootAmount: 5,
    towerLevel: 0,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Square],
      },
      {
        regionId: RegionName.Maratha,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Mysore,
        symbol: [],
      },
    ],
  },
  {
    id: RegionName.Mysore,
    status: RegionStatus.Sovereign,
    towerLevel: 2,
    lootAvailable: true,
    lootAmount: 5,
    unrest: 0,
    neighbors: [
      {
        regionId: RegionName.Bombay,
        symbol: [Symbol.Circle],
      },
      {
        regionId: RegionName.Hyderabad,
        symbol: [Symbol.Triangle],
      },
      {
        regionId: RegionName.Madras,
        symbol: [Symbol.Square],
      },
    ],
  },
];

export const EventDeck: EventCard[] = [
  {
    id: "foreign-invasion",
    type: EventType.ForeignInvasion,
    strength: 0,
    symbol: Symbol.Circle,
    Region: RegionName.Maratha,
    Description:
      "Roll storm die and resolve an Invasion in each region linked to a storm. If none, use top event card.) For each, roll a die to determine strength. If this region falls, close every order there and set its strength to half of the die roll (round down)",
  },
  {
    id: "shuffle",
    type: EventType.Shuffle,
    strength: 0,
    symbol: Symbol.Circle,
    Region: RegionName.Madras,
    Description:
      "Shuffle this tile in with the deck. Then shuffle the discards and place them on top.",
  },
  {
    id: "leader-1",
    type: EventType.Leader,
    strength: 3,
    symbol: Symbol.Circle,
    Region: RegionName.Punjab,
    Description: "",
  },
  {
    id: "leader-2",
    type: EventType.Leader,
    strength: 2,
    symbol: Symbol.Square,
    Region: RegionName.Bombay,
    Description: "",
  },
  {
    id: "leader-3",
    type: EventType.Leader,
    strength: 4,
    symbol: Symbol.Triangle,
    Region: RegionName.Hyderabad,
    Description: "",
  },
  {
    id: "leader-4",
    type: EventType.Leader,
    strength: 2,
    symbol: Symbol.Triangle,
    Region: RegionName.Bengal,
    Description: "",
  },
  {
    id: "peace-1",
    type: EventType.Peace,
    strength: 0,
    symbol: Symbol.Square,
    Region: RegionName.Mysore,
    Description: "",
  },
  {
    id: "peace-2",
    type: EventType.Peace,
    strength: 0,
    symbol: Symbol.Triangle,
    Region: RegionName.Madras,
    Description: "",
  },
  {
    id: "windfall-1",
    type: EventType.Windfall,
    strength: 0,
    symbol: Symbol.Triangle,
    Region: RegionName.Hyderabad,
    Description: "Gain 1£ for writers here and in adjacent regions.",
  },
  {
    id: "windfall-2",
    type: EventType.Windfall,
    strength: 0,
    symbol: Symbol.Triangle,
    Region: RegionName.Madras,
    Description: "Gain 1£ for writers here and in adjacent regions.",
  },
  {
    id: "turmoil-1",
    type: EventType.Turmoil,
    strength: 0,
    symbol: Symbol.Triangle,
    Region: RegionName.Delhi,
    Description:
      "Close northernmost open order. If all are closed, perform Cascade (close orders in connected regions).",
  },
  {
    id: "turmoil-2",
    type: EventType.Turmoil,
    strength: 0,
    symbol: Symbol.Triangle,
    Region: RegionName.Punjab,
    Description:
      "Close northernmost open order. If all are closed, perform Cascade (close orders in connected regions).",
  },
  {
    id: "turmoil-3",
    type: EventType.Turmoil,
    strength: 0,
    symbol: Symbol.Triangle,
    Region: RegionName.Maratha,
    Description:
      "Close northernmost open order. If all are closed, perform Cascade (close orders in connected regions).",
  },
  {
    id: "turmoil-4",
    type: EventType.Turmoil,
    strength: 0,
    symbol: Symbol.Triangle,
    Region: RegionName.Bombay,
    Description:
      "Close northernmost open order. If all are closed, perform Cascade (close orders in connected regions).",
  },
  {
    id: "resolve-crisis-1",
    type: EventType.ResolveCrisis,
    strength: 0,
    symbol: Symbol.Triangle,
    Region: RegionName.Delhi,
    Description: "",
  },
  {
    id: "resolve-crisis-2",
    type: EventType.ResolveCrisis,
    strength: -1,
    symbol: Symbol.Circle,
    Region: RegionName.Punjab,
    Description: "",
  },
  {
    id: "resolve-crisis-3",
    type: EventType.ResolveCrisis,
    strength: 3,
    symbol: Symbol.Circle,
    Region: RegionName.Maratha,
    Description: "",
  },
  {
    id: "resolve-crisis-4",
    type: EventType.ResolveCrisis,
    strength: 1,
    symbol: Symbol.Square,
    Region: RegionName.Bombay,
    Description: "",
  },
  {
    id: "resolve-crisis-5",
    type: EventType.ResolveCrisis,
    strength: 1,
    symbol: Symbol.Triangle,
    Region: RegionName.Bengal,
    Description: "",
  },
  {
    id: "resolve-crisis-6",
    type: EventType.ResolveCrisis,
    strength: 2,
    symbol: Symbol.Square,
    Region: RegionName.Mysore,
    Description: "",
  },
];
