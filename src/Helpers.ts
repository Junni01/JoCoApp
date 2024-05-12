import {
  CrisisType,
  Elephant,
  EventCard,
  Presidency,
  Region,
  RegionName,
  RegionStatus,
  RegionSymbol,
} from "./Types";

export const calculateEmpireStrength = (
  regionId: string,
  regions: Region[]
) => {
  let strength = 0;
  const region = regions.find((r) => r.id === regionId);

  if (!region) {
    console.error("calculateEmpireStrength: Region Not Found!");
    return 0;
  }

  if (region.status === RegionStatus.EmpireCapital) {
    strength += region.towerLevel;
    console.log("empire base strength", strength);

    const dominatedRegions = regions.filter((r) => r.dominator === region.id);

    console.log("dominated regions", dominatedRegions);

    dominatedRegions.forEach((r) => (strength += r.towerLevel));
    return strength;
  } else if (region.status === RegionStatus.Dominated) {
    const empireCapital = regions.find((r) => r.id === region.dominator);

    if (!empireCapital) {
      console.error(
        "calculateEmpireStrength: Region is Dominated but no empire capital was found!"
      );
      return 0;
    }
    strength += empireCapital.towerLevel;
    const dominatedRegions = regions.filter(
      (r) => r.dominator === empireCapital.id
    );
    dominatedRegions.forEach((r) => (strength += r.towerLevel));
    return strength;
  } else {
    console.error(
      "calculateEmpireStrength: Region is neither empire capital or a dominated region!"
    );
    return 0;
  }
};

export const getEmpireDominatedRegionIds = (
  empireId: string,
  regions: Region[]
) => {
  return regions.filter((r) => r.dominator === empireId).map((r) => r.id);
};

export const marchElephant = (
  targetRegion: Region,
  regions: Region[],
  symbol: RegionSymbol
) => {
  console.log("March Elephant!");

  if (targetRegion.status === RegionStatus.CompanyControlled) {
    console.log("Elephants March: Company controlled Region Rebellion");
    return {
      MainRegion: targetRegion.id,
      TargetRegion: undefined,
    } as Elephant;
  }
  if (targetRegion.status === RegionStatus.Dominated) {
    console.log("Elephants March: Dominated Region rebels against dominator");
    return {
      MainRegion: targetRegion.id,
      TargetRegion: targetRegion.dominator,
    } as Elephant;
  }
  if (targetRegion.status === RegionStatus.Sovereign) {
    const symbolRegion = targetRegion.neighbors.find((r) =>
      r.symbol.includes(symbol)
    );
    if (!symbolRegion) {
      console.error(
        "Symbol neighbor for sovereign region not found",
        targetRegion + symbol
      );
    }
    console.log(
      `Elephants March: Sovereign Region ${targetRegion.id} targets neighbor ${symbolRegion?.regionId}`
    );
    return {
      MainRegion: targetRegion.id,
      TargetRegion: symbolRegion?.regionId,
    } as Elephant;
  }
  if (targetRegion.status === RegionStatus.EmpireCapital) {
    console.log(
      `Elephants March: Empire Region ${targetRegion.id} targets neighbor`
    );
    const neighborIds = targetRegion.neighbors.map((r) => r.regionId);
    const neighbors = regions.filter((r) => neighborIds.includes(r.id));

    if (neighbors.every((r) => r.dominator === targetRegion.id)) {
      console.log(
        "Elephants March: No non-dominated neighbors found, inciting rebellion against empire"
      );
      const rebellingRegion = targetRegion.neighbors.find((r) =>
        r.symbol.includes(symbol)
      );

      if (!rebellingRegion) {
        console.error("symbol region should exist!");
      }

      return {
        MainRegion: rebellingRegion?.regionId,
        TargetRegion: targetRegion.id,
      } as Elephant;
    }

    const primaryTargetNeighbor = targetRegion.neighbors.find((r) =>
      r.symbol.includes(symbol)
    );

    if (!primaryTargetNeighbor) {
      console.error("symbol region should exist!");
      return;
    }

    const primaryTarget = regions.find(
      (r) => r.id === primaryTargetNeighbor?.regionId
    );

    if (!primaryTarget) {
      console.error("symbol region should exist!");
      return;
    }

    if (primaryTarget.dominator !== targetRegion.id) {
      console.log(
        `Elephants March: Empire ${targetRegion.id} primary target region is not dominated by the empire ${primaryTarget.id} selected as target`
      );
      return {
        MainRegion: targetRegion.id,
        TargetRegion: primaryTarget.id,
      } as Elephant;
    } else {
      console.log(
        `Elephants March: Empire ${targetRegion.id} primary target region is ${primaryTarget.id} but it is already dominated by ${targetRegion.id}`
      );
    }

    let primaryTargetIndex =
      targetRegion.neighbors.indexOf(primaryTargetNeighbor) + 1;

    console.log(
      `Elephants March: Primary target index is ${primaryTargetIndex}`
    );

    const maxAttempts = targetRegion.neighbors.length;

    for (let i = 0; i < maxAttempts; i++) {
      if (primaryTargetIndex === targetRegion.neighbors.length) {
        console.log(
          `Elephants March: Primary target index is the last index, staring from the beginning of the array`
        );
        primaryTargetIndex = 0;
      }
      const targetNeighbour = targetRegion.neighbors[primaryTargetIndex];
      console.log(
        `Elephants March: Next primary target is ${targetNeighbour.regionId} at index ${primaryTargetIndex}`
      );

      const target = regions.find((r) => r.id === targetNeighbour.regionId);

      if (target?.dominator !== targetRegion.id) {
        return {
          MainRegion: targetRegion.id,
          TargetRegion: target?.id,
        } as Elephant;
      }
      primaryTargetIndex = primaryTargetIndex + 1;
    }
  }

  console.error("No target region found");
  return {
    MainRegion: targetRegion.id,
    TargetRegion: undefined,
  } as Elephant;
};

export const doesLossOfRegionCauseEmpireShatter = (
  lostRegion: Region,
  regions: Region[]
) => {
  if (lostRegion.status === RegionStatus.EmpireCapital) {
    return true;
  }

  if (lostRegion.status === RegionStatus.Dominated) {
    console.log("doesLossOfRegionCauseEmpireShatter: Dominated Region");
    const empireCapital = regions.find((r) => r.id === lostRegion.dominator);
    if (!empireCapital) {
      console.error(
        "doesLossOfRegionCauseEmpireShatter: Empire Capital not found for Dominated Region"
      );
      return false;
    }

    const empireDominatedRegions = regions.filter(
      (r) => r.dominator === empireCapital.id && r.id !== lostRegion.id
    );
    if (empireDominatedRegions.length === 0) {
      return true;
    } else {
      return false;
    }
  }
  console.error(
    "doesLossOfRegionCauseEmpireShatter: Target region is not empire capital or dominated region"
  );
  return false;
};

export const getCrisisType = (elephant: Elephant, regions: Region[]) => {
  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker) {
    console.error("getCrisisType: Elephant main region not found!");
    return;
  }

  if (attacker.status === RegionStatus.CompanyControlled) {
    if (defender) {
      console.error(
        "getCrisisType: Elephant main region is company controlled but elephant target region is not null!"
      );
      return;
    }
    return CrisisType.CompanyControlledRebels;
  }

  if (!defender) {
    console.error(
      "getCrisisType: elephant main region is not company controlled and elephant target region is null!"
    );
    return;
  }

  if (
    attacker.status === RegionStatus.Dominated &&
    attacker.dominator === defender.id
  ) {
    return CrisisType.DominatedRebelsAgainstEmpire;
  }

  switch (attacker.status) {
    case RegionStatus.EmpireCapital:
      if (defender.status === RegionStatus.CompanyControlled) {
        return CrisisType.EmpireInvadesCompany;
      } else if (defender.status === RegionStatus.Sovereign) {
        return CrisisType.EmpireInvadesSovereign;
      } else if (defender.status === RegionStatus.Dominated) {
        return CrisisType.EmpireInvadesDominated;
      } else if (defender.status === RegionStatus.EmpireCapital) {
        return CrisisType.EmpireCapitalInvadesEmpireCapital;
      }
      break;

    case RegionStatus.Sovereign:
      if (defender.status === RegionStatus.CompanyControlled) {
        return CrisisType.SovereignInvadesCompany;
      } else if (defender.status === RegionStatus.EmpireCapital) {
        return CrisisType.SovereignInvadesEmpireCapital;
      } else if (defender.status === RegionStatus.Dominated) {
        return CrisisType.SovereignInvadesDominated;
      } else if (defender.status === RegionStatus.Sovereign) {
        return CrisisType.SovereignInvadesSovereign;
      }
      break;

    default:
      console.error(
        `Crisis type not found: ${attacker.status} - ${defender?.status}`
      );
  }
};

export const shuffleEventPile = (pile: EventCard[]) => {
  for (let i = pile.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pile[i], pile[j]] = [pile[j], pile[i]];
  }
  return pile;
};

export const isValidDeployRegion = (
  presidency: Presidency,
  region: Region,
  regions: Region[]
) => {
  console.log("isValidDeployRegion: ", presidency, region.id);

  if (presidency === Presidency.BengalPresidency) {
    if (region.id === RegionName.Bengal) {
      return true;
    }

    if (region.id === RegionName.Madras || region.id === RegionName.Bombay) {
      return false;
    }
  }

  if (presidency === Presidency.MadrasPresidency) {
    if (region.id === RegionName.Madras) {
      return true;
    }

    if (region.id === RegionName.Bengal || region.id === RegionName.Bombay) {
      return false;
    }
  }

  if (presidency === Presidency.BombayPresidency) {
    if (region.id === RegionName.Bombay) {
      return true;
    }

    if (region.id === RegionName.Madras || region.id === RegionName.Bengal) {
      return false;
    }
  }

  const neighboringRegions = region.neighbors.map((n) =>
    regions.find((r) => r.id === n.regionId)
  );
  return neighboringRegions.some(
    (r) => r?.controllingPresidency === presidency
  );
};
