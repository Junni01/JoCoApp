import { Region, RegionStatus } from "./Types";

export const calculateEmpireStrength = (
  regionId: string,
  regions: Region[]
) => {
  let strength = 0;
  const region = regions.find((r) => r.id === regionId);

  if (!region) {
    console.error("calculateEmpireStrength: Region Not Found!");
    return;
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
      return;
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
  }
};
