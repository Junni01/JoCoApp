import { Elephant, Region, RegionStatus, RegionSymbol } from "./Types";

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
    const dominatedRegions = regions.filter((r) => r.dominator === region.id);
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
  return regions.filter((r) => r.dominator === empireId);
};

export const marchElephant = (
  targetRegion: Region,
  regions: Region[],
  symbol: RegionSymbol
) => {
  switch (targetRegion.status) {
    case RegionStatus.CompanyControlled:
      return {
        MainRegion: targetRegion.id,
        TargetRegion: undefined,
      } as Elephant;
    case RegionStatus.Dominated:
      return {
        MainRegion: targetRegion.id,
        TargetRegion: targetRegion.dominator,
      } as Elephant;
    case RegionStatus.Sovereign:
      const symbolRegion = targetRegion.neighbors.find((r) =>
        r.symbol.includes(symbol)
      );
      if (!symbolRegion) {
        console.error(
          "Symbol neighbor for sovereign region not found",
          targetRegion + symbol
        );
      }
      return {
        MainRegion: targetRegion.id,
        TargetRegion: symbolRegion?.regionId,
      } as Elephant;
    case RegionStatus.EmpireCapital:
      const neighborIds = targetRegion.neighbors.map((r) => r.regionId);
      const neighbors = regions.filter((r) => neighborIds.includes(r.id));

      if (neighbors.every((r) => r.dominator === targetRegion.id)) {
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

      if (primaryTarget.dominator !== targetRegion.dominator) {
        return {
          MainRegion: targetRegion.id,
          TargetRegion: primaryTarget.id,
        } as Elephant;
      }

      let primaryTargetIndex = targetRegion.neighbors.indexOf(
        primaryTargetNeighbor
      );

      const maxAttempts = targetRegion.neighbors.length;

      for (let i = 0; i < maxAttempts; i++) {
        if (primaryTargetIndex === targetRegion.neighbors.length) {
          primaryTargetIndex = 0;
        }

        const targetNeighbour = targetRegion.neighbors[primaryTargetIndex];

        const target = regions.find((r) => r.id === targetNeighbour.regionId);

        if (target?.dominator !== targetRegion.id) {
          return {
            MainRegion: targetRegion.id,
            TargetRegion: target?.id,
          } as Elephant;
        }
      }

      console.error("No target region found");
      return {
        MainRegion: targetRegion.id,
        TargetRegion: undefined,
      } as Elephant;
  }
};
