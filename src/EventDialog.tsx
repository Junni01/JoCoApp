import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Elephant, EventCard, EventType, Region, RegionStatus } from "./Types";
import {
  calculateEmpireStrength,
  getEmpireDominatedRegionIds,
  marchElephant,
} from "./Helpers";

type EvenDialogProps = {
  event: EventCard;
  drawStackRegion: Region;
  regions: Region[];
  elephant: Elephant;
  onOk: () => void;
};

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

export const EventDialog = (props: EvenDialogProps) => {
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
        `Crisit type not found: ${attacker.status} - ${defender?.status}`
      );
    }
  };

  const renderDialogTitle = () => {
    switch (props.event.type) {
      case EventType.ForeignInvasion:
        return "Event: Foreign Invasion";
      case EventType.Shuffle:
        return "Event: Shuffle";
      case EventType.Windfall:
        return `Event: Windfall in ${props.drawStackRegion.id}`;
      case EventType.Leader:
        if (props.drawStackRegion.status === RegionStatus.Sovereign) {
          return `Event: Leader in ${props.drawStackRegion.id}. The regions strength grows `;
        } else {
          return `Event: Leader in ${props.drawStackRegion.id}. The region rebels`;
        }
      case EventType.Turmoil:
        return `Event: Turmoil in ${props.drawStackRegion.id}`;
      case EventType.Peace:
        if (props.elephant.TargetRegion === undefined) {
          return `Event: Peace in ${props.elephant.MainRegion}`;
        } else {
          return `Event: Peace between ${props.elephant.MainRegion} and ${props.elephant.TargetRegion}`;
        }
      case EventType.ResolveCrisis:
        const crisisType = getCrisisType();

        switch (crisisType) {
          case CrisisType.SovereignInvadesSovereign:
          case CrisisType.SovereignInvadesDominated:
          case CrisisType.SovereignInvadesEmpireCapital:
          case CrisisType.EmpireInvadesSovereign:
          case CrisisType.SovereignInvadesCompany:
          case CrisisType.EmpireInvadesCompany:
            return `Event: Crisis, ${props.elephant.MainRegion} invades ${props.elephant.TargetRegion}`;
          case CrisisType.DominatedRebelsAgainstEmpire:
          case CrisisType.CompanyControlledRebels:
            return `Event: Crisis, Rebellion in ${props.elephant.MainRegion}`;
          default:
            return "Crisis Type not found";
        }
    }
  };

  const renderDialogContent = () => {
    switch (props.event.type) {
      case EventType.Shuffle:
        return (
          <Typography>
            Shuffle event is shuffled into the draw stack and discard pile is
            shuffled and put on top of the draw stack
          </Typography>
        );
      case EventType.Windfall:
        return (
          <Typography>
            Players take 1£ for each writer they have on:{" "}
            {props.drawStackRegion.id},{" "}
            {props.drawStackRegion.neighbors.map((r) => r.regionId).join(",")}
          </Typography>
        );
      case EventType.Turmoil:
        return (
          <Typography>
            Close northernmost open order in {props.drawStackRegion.id}. Any
            writer on the order is returned to that player's supply. If all
            orders in this region are already closed, perform a Cascade.
          </Typography>
        );
      case EventType.Leader:
        if (
          props.drawStackRegion.status === RegionStatus.Sovereign ||
          props.drawStackRegion.status === RegionStatus.EmpireCapital
        ) {
          return (
            <Typography>
              Add 1 tower level to {props.drawStackRegion.id}
            </Typography>
          );
        } else if (props.drawStackRegion.status === RegionStatus.Dominated) {
          const dominator = props.regions.find(
            (r) => r.id === props.drawStackRegion.dominator
          );

          if (!dominator) {
            console.error(
              "EventDialog:EventTypeLeader: Dominator for dominated region not found!"
            );
            return;
          }
          const rebellionStrength =
            props.drawStackRegion.towerLevel + props.event.strength;
          const dominatorStrength = dominator.towerLevel;
          const rebellionSuccessful = rebellionStrength > dominatorStrength;

          return (
            <>
              <Typography>
                Rebellion in dominated {props.drawStackRegion.id} against the
                capital {props.drawStackRegion.dominator}.
              </Typography>
              {rebellionSuccessful ? (
                <Typography>
                  Rebellion in {props.drawStackRegion.id} is Successful, remove
                  empire flag and close every open order in{" "}
                  {props.drawStackRegion.id}. If all orders are already closed,
                  perform a Cascade. The Region is now Sovereign.{" "}
                </Typography>
              ) : (
                <Typography>
                  Rebellion in {props.drawStackRegion.id} failed. Remove one
                  tower level from {dominator.id}.
                </Typography>
              )}
            </>
          );
        } else if (
          props.drawStackRegion.status === RegionStatus.CompanyControlled
        ) {
          const additionalCrises = props.regions.filter(
            (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
          );

          return (
            <>
              <Typography>
                Rebellion in {props.drawStackRegion.id} against the company. The
                rebellion strength is{" "}
                {props.drawStackRegion.unrest + props.event.strength}
              </Typography>
              {additionalCrises.length > 0 && (
                <Typography>
                  Additional Crises in{" "}
                  {additionalCrises.map((r) => r.id).join(",")}
                </Typography>
              )}
            </>
          );
        } else {
          return;
        }
      case EventType.Peace:
        const newElephantRegion = marchElephant(
          props.drawStackRegion,
          props.regions,
          props.event.symbol
        );

        if (props.elephant.TargetRegion !== undefined) {
          const peaceTargetRegion = props.regions.find(
            (r) => r.id === props.elephant.TargetRegion
          );
          return (
            <>
              <Typography>
                Open all orders that are connected through the border between{" "}
                {props.elephant.MainRegion} and {props.elephant.TargetRegion}
              </Typography>
              <Typography>
                Add one tower level to {props.elephant.MainRegion}{" "}
                {peaceTargetRegion?.status === RegionStatus.CompanyControlled
                  ? ""
                  : `and ${props.elephant.TargetRegion}`}
              </Typography>
              <Typography>
                Elephant marches to {newElephantRegion?.MainRegion}{" "}
                {!newElephantRegion?.TargetRegion
                  ? ""
                  : `and faces ${newElephantRegion.TargetRegion}`}
              </Typography>
            </>
          );
        } else {
          return (
            <>
              <Typography>
                Open all orders and remove unrest in {props.elephant.MainRegion}
              </Typography>
              <Typography>
                Elephant marches to {newElephantRegion?.MainRegion}{" "}
                {!newElephantRegion?.TargetRegion
                  ? ""
                  : `and faces ${newElephantRegion.TargetRegion}`}
              </Typography>
            </>
          );
        }
      case EventType.ResolveCrisis:
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
        let regionsWithUnrest = props.regions.filter(
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
                <Typography>
                  {attacker.id} strength {attackStrength} against {defender?.id}{" "}
                  strength {defenseStrength}
                </Typography>
                {actionSuccessful ? (
                  <Typography>
                    {attacker.id} successfully invades {defender?.id}. Place
                    large empire flag on {attacker.id} and small empire flag on{" "}
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
                <Typography>
                  {attacker.id} strength {attackStrength} against {defender?.id}{" "}
                  strength {defenseStrength}
                </Typography>
                {actionSuccessful ? (
                  <Typography>
                    {attacker.id} successfully invades {defender?.id}. Place
                    large empire flag on {attacker.id} and replace small empire
                    flag on
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
                <Typography>
                  {attacker.id} strength {attackStrength} against {defender?.id}{" "}
                  strength {defenseStrength}
                </Typography>
                {actionSuccessful ? (
                  <Typography>
                    {attacker.id} successfully invades {defender?.id}. Place
                    large empire flag on {attacker.id} and remove large empire
                    flag from
                    {defender?.id} and replace it with a new small empire flag.
                    Remove small empire flags from:{" "}
                    {getEmpireDominatedRegionIds(
                      defender.id,
                      props.regions
                    ).join(",")}
                  </Typography>
                ) : (
                  <Typography>
                    {attacker.id} fails to invade {defender?.id}.{" "}
                    {attacker.towerLevel > 0
                      ? `Remove one tower level from ${attacker.id}`
                      : ""}
                  </Typography>
                )}
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
                <Typography>
                  {attacker.id} strength {attackStrength} against {defender?.id}{" "}
                  strength {defenseStrength}
                </Typography>
                {actionSuccessful ? (
                  <Typography>
                    {attacker.id} successfully rebels against {defender?.id}.
                    Remove
                    {attacker.id} empire's small flag from {defender.id}. It is
                    now a Sovereign region.
                  </Typography>
                ) : (
                  <Typography>
                    {attacker.id} fails to rebels against {defender?.id}.
                    {attacker.towerLevel > 0
                      ? `The empire is left weakened by the rebellion. Remove one tower level from ${defender.id}`
                      : ""}
                  </Typography>
                )}
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
                <Typography>
                  {attacker.id} invades company controlled {defender.id}. The
                  attacking strength is {attackStrength}. Exhaust pieces in the{" "}
                  {attacker.controllingPresidency} army to mount defense, if the
                  newly-mounted pieces do not equal the attack strength the
                  invasion succeeds.
                </Typography>
                {regionsWithUnrest.length > 0 && (
                  <Typography>
                    Invasion triggers rebellions across india: resolve rebellion
                    in {regionsWithUnrest.join(", ")}
                  </Typography>
                )}
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
                <Typography>
                  {attacker.id} invades company controlled {defender.id}. The
                  attacking strength is {attackStrength}. Exhaust pieces in the{" "}
                  {attacker.controllingPresidency} army to mount defense, if the
                  newly-mounted pieces do not equal the attack strength the
                  invasion succeeds.
                </Typography>
                {regionsWithUnrest.length > 0 && (
                  <Typography>
                    Invasion triggers rebellions across india: resolve rebellion
                    in {regionsWithUnrest.join(", ")}
                  </Typography>
                )}
              </>
            );
          case CrisisType.CompanyControlledRebels:
            attackStrength = attacker.unrest + props.event.strength;
            return (
              <>
                <Typography>
                  {attacker.id} rebels against the Company. The attacking
                  strength is {attackStrength}. Exhaust pieces in the{" "}
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
              </>
            );
          default:
            console.error(
              "Crisis Type Switch Case Default: This should not happen"
            );
            return;
        }
      case EventType.ForeignInvasion:
        return <Typography>Foreign Invasion</Typography>;

      default:
        return <Typography>Default Case</Typography>;
    }
  };

  return (
    <Dialog open={true}>
      <DialogTitle>{renderDialogTitle()}</DialogTitle>
      <DialogContent>{renderDialogContent()}</DialogContent>
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};
