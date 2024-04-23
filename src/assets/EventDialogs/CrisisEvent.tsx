import { DialogContent, DialogTitle, Typography } from "@mui/material";
import {
  calculateEmpireStrength,
  getEmpireDominatedRegionIds,
} from "../../Helpers";
import {
  Region,
  Elephant,
  EventCard,
  RegionStatus,
  CrisisType,
} from "../../Types";

export const CrisisEvent = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
}) => {
  const getCrisisType = () => {
    const attacker = props.regions.find(
      (r) => r.id === props.elephant.MainRegion
    );
    const defender = props.regions.find(
      (r) => r.id === props.elephant.TargetRegion
    );

    if (!attacker) {
      console.error("EventDialog: Elephant main region not found!");
      return;
    }

    if (attacker.status === RegionStatus.CompanyControlled) {
      return CrisisType.CompanyControlledRebels;
    } else if (
      attacker.status === RegionStatus.Dominated &&
      attacker.dominator === defender?.id
    ) {
      return CrisisType.DominatedRebelsAgainstEmpire;
    } else if (
      (attacker.status === RegionStatus.EmpireCapital ||
        attacker.status === RegionStatus.Dominated) &&
      defender?.status === RegionStatus.CompanyControlled
    ) {
      return CrisisType.EmpireInvadesCompany;
    } else if (
      attacker.status === RegionStatus.Sovereign &&
      defender?.status === RegionStatus.CompanyControlled
    ) {
      return CrisisType.SovereignInvadesCompany;
    } else if (
      (attacker.status === RegionStatus.EmpireCapital ||
        attacker.status === RegionStatus.Dominated) &&
      defender?.status === RegionStatus.Sovereign
    ) {
      return CrisisType.EmpireInvadesSovereign;
    } else if (
      attacker.status === RegionStatus.Sovereign &&
      defender?.status === RegionStatus.EmpireCapital
    ) {
      return CrisisType.SovereignInvadesEmpireCapital;
    } else if (
      attacker.status === RegionStatus.Sovereign &&
      defender?.status === RegionStatus.Dominated
    ) {
      return CrisisType.SovereignInvadesDominated;
    } else if (
      attacker.status === RegionStatus.Sovereign &&
      defender?.status === RegionStatus.Sovereign
    ) {
      return CrisisType.SovereignInvadesSovereign;
    } else {
      console.error(
        `Crisis type not found: ${attacker.status} - ${defender?.status}`
      );
    }
  };

  const crisisType = getCrisisType();
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  if (!attacker) {
    console.error("EventDialog: Elephant main region not found!");
    return;
  }

  let attackStrength = 0;
  let defenseStrength = 0;
  let actionSuccessful = false;
  const regionsWithUnrest = props.regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  switch (crisisType) {
    case CrisisType.SovereignInvadesSovereign:
      if (!defender) {
        console.error("Defender should exist");
        return;
      }
      attackStrength = attacker.towerLevel + props.event.strength;
      defenseStrength = defender?.towerLevel ?? 0;
      actionSuccessful = attackStrength > defenseStrength;
      return (
        <>
          <DialogTitle>
            Event: Crisis, {props.elephant.MainRegion} invades{" "}
            {props.elephant.TargetRegion}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {attacker.id} strength {attackStrength} against {defender?.id}{" "}
              strength {defenseStrength}
            </Typography>
            {actionSuccessful ? (
              <Typography>
                {attacker.id} successfully invades {defender?.id}. Place large
                empire flag on {attacker.id} and small empire flag on{" "}
                {defender?.id}{" "}
              </Typography>
            ) : (
              <Typography>
                {attacker.id} fails to invade {defender?.id}.{" "}
                {attacker.towerLevel > 0
                  ? `Remove one tower level from ${attacker.id}`
                  : ""}
              </Typography>
            )}
          </DialogContent>
        </>
      );

    case CrisisType.SovereignInvadesDominated:
      if (!defender) {
        console.error("Defender should exist");
        return;
      }
      attackStrength = attacker.towerLevel + props.event.strength;
      defenseStrength =
        calculateEmpireStrength(defender.id, props.regions) ?? 0;
      actionSuccessful = attackStrength > defenseStrength;
      return (
        <>
          <DialogTitle>
            Event: Crisis, {props.elephant.MainRegion} invades{" "}
            {props.elephant.TargetRegion}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {attacker.id} strength {attackStrength} against {defender?.id}{" "}
              strength {defenseStrength}
            </Typography>
            {actionSuccessful ? (
              <Typography>
                {attacker.id} successfully invades {defender?.id}. Place large
                empire flag on {attacker.id} and replace small empire flag on
                {defender?.id} with the new empire's flag.
              </Typography>
            ) : (
              <Typography>
                {attacker.id} fails to invade {defender?.id}.{" "}
                {attacker.towerLevel > 0
                  ? `Remove one tower level from ${attacker.id}`
                  : ""}
              </Typography>
            )}
          </DialogContent>
        </>
      );

    case CrisisType.SovereignInvadesEmpireCapital:
      if (!defender) {
        console.error("Defender should exist");
        return;
      }
      attackStrength = attacker.towerLevel + props.event.strength;
      defenseStrength =
        calculateEmpireStrength(defender.id, props.regions) ?? 0;
      actionSuccessful = attackStrength > defenseStrength;
      return (
        <>
          <DialogTitle>
            Event: Crisis, {props.elephant.MainRegion} invades{" "}
            {props.elephant.TargetRegion}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {attacker.id} strength {attackStrength} against {defender?.id}{" "}
              strength {defenseStrength}
            </Typography>
            {actionSuccessful ? (
              <Typography>
                {attacker.id} successfully invades {defender?.id}. Place large
                empire flag on {attacker.id} and remove large empire flag from
                {defender?.id} and replace it with a new small empire flag.
                Remove small empire flags from:{" "}
                {getEmpireDominatedRegionIds(defender.id, props.regions).join(
                  ","
                )}
              </Typography>
            ) : (
              <Typography>
                {attacker.id} fails to invade {defender?.id}.{" "}
                {attacker.towerLevel > 0
                  ? `Remove one tower level from ${attacker.id}`
                  : ""}
              </Typography>
            )}
          </DialogContent>
        </>
      );
    case CrisisType.EmpireInvadesSovereign:
      if (!defender) {
        console.error("Defender should exist");
        return;
      }
      attackStrength =
        calculateEmpireStrength(defender.id, props.regions) ??
        0 + props.event.strength;
      defenseStrength = defender.towerLevel;
      actionSuccessful = attackStrength > defenseStrength;
      return (
        <>
          <DialogTitle>
            Event: Crisis, {props.elephant.MainRegion} invades{" "}
            {props.elephant.TargetRegion}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {attacker.id} strength {attackStrength} against {defender?.id}{" "}
              strength {defenseStrength}
            </Typography>
            {actionSuccessful ? (
              <Typography>
                {attacker.id} successfully invades {defender?.id}. Place{" "}
                {attacker.id} empire's small flag on {defender.id}
              </Typography>
            ) : (
              <Typography>
                {attacker.id} fails to invade {defender?.id}.{" "}
                {attacker.towerLevel > 0
                  ? `Remove one tower level from ${attacker.id}`
                  : ""}
              </Typography>
            )}
          </DialogContent>
        </>
      );
    case CrisisType.DominatedRebelsAgainstEmpire:
      if (!defender) {
        console.error("Defender should exist");
        return;
      }
      attackStrength = attacker.towerLevel + props.event.strength;
      defenseStrength = defender.towerLevel;
      actionSuccessful = attackStrength > defenseStrength;
      return (
        <>
          <DialogTitle>
            Event: Crisis, Rebellion in {props.elephant.MainRegion}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {attacker.id} strength {attackStrength} against {defender?.id}{" "}
              strength {defenseStrength}
            </Typography>
            {actionSuccessful ? (
              <Typography>
                {attacker.id} successfully rebels against {defender?.id}. Remove{" "}
                {attacker.id} empire's small flag from {defender.id}. It is now
                a Sovereign region.
              </Typography>
            ) : (
              <Typography>
                {attacker.id} fails to rebels against {defender?.id}.
                {attacker.towerLevel > 0
                  ? `The empire is left weakened by the rebellion. Remove one tower level from ${defender.id}`
                  : ""}
              </Typography>
            )}
          </DialogContent>
        </>
      );
    case CrisisType.SovereignInvadesCompany:
      if (!defender) {
        console.error("Defender should exist");
        return;
      }
      attackStrength =
        attacker.towerLevel + props.event.strength + defender.unrest;
      return (
        <>
          <DialogTitle>
            Event: Crisis, {props.elephant.MainRegion} invades{" "}
            {props.elephant.TargetRegion}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {attacker.id} invades company controlled {defender.id}. The
              attacking strength is {attackStrength}. Exhaust pieces in the{" "}
              {attacker.controllingPresidency} army to mount defense, if the
              newly-mounted pieces do not equal the attack strength the invasion
              succeeds.
            </Typography>
            {regionsWithUnrest.length > 0 && (
              <Typography>
                Invasion triggers rebellions across india: resolve rebellion in{" "}
                {regionsWithUnrest.join(", ")}
              </Typography>
            )}
          </DialogContent>
        </>
      );
    case CrisisType.EmpireInvadesCompany:
      if (!defender) {
        console.error("Defender should exist");
        return;
      }
      attackStrength =
        calculateEmpireStrength(attacker.id, props.regions) +
        props.event.strength +
        defender.unrest;
      return (
        <>
          <DialogTitle>
            Event: Crisis, {props.elephant.MainRegion} invades{" "}
            {props.elephant.TargetRegion}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {attacker.id} invades company controlled {defender.id}. The
              attacking strength is {attackStrength}. Exhaust pieces in the{" "}
              {attacker.controllingPresidency} army to mount defense, if the
              newly-mounted pieces do not equal the attack strength the invasion
              succeeds.
            </Typography>
            {regionsWithUnrest.length > 0 && (
              <Typography>
                Invasion triggers rebellions across india: resolve rebellion in{" "}
                {regionsWithUnrest.join(", ")}
              </Typography>
            )}
          </DialogContent>
        </>
      );
    case CrisisType.CompanyControlledRebels:
      attackStrength = attacker.unrest + props.event.strength;
      return (
        <>
          <DialogTitle>
            Event: Crisis, Rebellion in ${props.elephant.MainRegion}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {attacker.id} rebels against the Company. The attacking strength
              is {attackStrength}. Exhaust pieces in the{" "}
              {attacker.controllingPresidency} army to mount defense, if the
              newly-mounted pieces do not equal the attack strength the
              rebellion succeeds.
            </Typography>
            {regionsWithUnrest.length > 0 && (
              <Typography>
                Rebellion incites rebellions across other regions: resolve
                rebellion in {regionsWithUnrest.join(", ")}
              </Typography>
            )}
          </DialogContent>
        </>
      );
    default:
      console.error("Crisis Type Switch Case Default: This should not happen");
      return;
  }
};
