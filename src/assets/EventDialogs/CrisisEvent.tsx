import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import {
  calculateEmpireStrength,
  doesEmpireShatter,
  getCrisisType,
  getEmpireDominatedRegionIds,
} from "../../Helpers";
import {
  Region,
  Elephant,
  EventCard,
  RegionStatus,
  CrisisType,
  Rebellion,
} from "../../Types";
import { useState } from "react";

export const CrisisEvent = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: (primaryCrisisWon: boolean, rebellions: Rebellion[]) => void;
}) => {
  const additionalCrises = props.regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  const [rebellions, setRebellions] = useState<Rebellion[]>(
    additionalCrises.map(
      (r) => ({ Region: r, RebellionSuccessful: false } as Rebellion)
    )
  );
  const [mainCrisisWon, setMainCrisisWon] = useState<boolean>(false);

  const handleResolveCrisis = (
    Region: Region,
    RebellionSuccessful: boolean
  ) => {
    const rebellion = rebellions.find((r) => r.Region === Region);
    if (rebellion) {
      rebellion.RebellionSuccessful = RebellionSuccessful;
      setRebellions([...rebellions]);
    }
  };

  const crisisType = getCrisisType(props.elephant, props.regions);

  switch (crisisType) {
    case CrisisType.SovereignInvadesSovereign:
      return (
        <SovereignInvadesSovereign
          regions={props.regions}
          elephant={props.elephant}
          event={props.event}
          onOk={() => props.onOk(false, [])}
        />
      );
    case CrisisType.SovereignInvadesDominated:
      return (
        <SovereignInvadesDominated
          regions={props.regions}
          elephant={props.elephant}
          event={props.event}
          onOk={() => props.onOk(false, [])}
        />
      );

    case CrisisType.SovereignInvadesEmpireCapital:
      return (
        <SovereignInvadesEmpireCapital
          regions={props.regions}
          elephant={props.elephant}
          event={props.event}
          onOk={() => props.onOk(false, [])}
        />
      );
    case CrisisType.EmpireInvadesSovereign:
      return (
        <EmpireInvadesSovereign
          regions={props.regions}
          elephant={props.elephant}
          event={props.event}
          onOk={() => props.onOk(false, [])}
        />
      );

    case CrisisType.DominatedRebelsAgainstEmpire:
      return (
        <DominatedRebelsAgainstEmpire
          regions={props.regions}
          elephant={props.elephant}
          event={props.event}
          onOk={() => props.onOk(false, [])}
        />
      );

    case CrisisType.SovereignInvadesCompany:
      return (
        <SovereignInvadesCompany
          regions={props.regions}
          elephant={props.elephant}
          event={props.event}
          onOk={() => props.onOk(mainCrisisWon, rebellions)}
        />
      );

    case CrisisType.EmpireInvadesCompany:
      return (
        <EmpireInvadesCompany
          regions={props.regions}
          elephant={props.elephant}
          event={props.event}
          onOk={() => props.onOk(mainCrisisWon, rebellions)}
        />
      );

    case CrisisType.CompanyControlledRebels:
      return (
        <CompanyControlledRebels
          regions={props.regions}
          elephant={props.elephant}
          event={props.event}
          onOk={() => props.onOk(mainCrisisWon, rebellions)}
        />
      );
    default:
      console.error("Crisis Type Switch Case Default: This should not happen");
      return;
  }
};

const SovereignInvadesSovereign = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: () => void;
}) => {
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.towerLevel + props.event.strength;
  const defenseStrength = defender?.towerLevel ?? 0;
  const actionSuccessful = attackStrength > defenseStrength;
  return (
    <Dialog open={true}>
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
            empire flag on {attacker.id} and small empire flag on {defender?.id}{" "}
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
    </Dialog>
  );
};
const SovereignInvadesDominated = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: () => void;
}) => {
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.towerLevel + props.event.strength;
  const defenseStrength =
    calculateEmpireStrength(defender.id, props.regions) ?? 0;
  const actionSuccessful = attackStrength > defenseStrength;
  return (
    <Dialog open={true}>
      <DialogTitle>
        Event: Crisis, {props.elephant.MainRegion} invades{" "}
        {props.elephant.TargetRegion}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {attacker.id} strength {attackStrength} against {defender?.id}{" "}
          Empire's strength {defenseStrength}
        </Typography>
        {actionSuccessful ? (
          <>
            <Typography>
              {attacker.id} successfully invades {defender?.id}. Place large
              empire flag on {attacker.id} and replace small empire flag on
              {defender?.id} with the new empire's flag.
            </Typography>
            {doesEmpireShatter(defender, props.regions) && (
              <Typography>
                {defender.dominator} Empire shatters: Remove large flag from{" "}
                {defender.dominator}
              </Typography>
            )}
          </>
        ) : (
          <Typography>
            {attacker.id} fails to invade {defender?.id}.{" "}
            {attacker.towerLevel > 0
              ? `Remove one tower level from ${attacker.id}`
              : ""}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
const SovereignInvadesEmpireCapital = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: () => void;
}) => {
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.towerLevel + props.event.strength;
  const defenseStrength =
    calculateEmpireStrength(defender.id, props.regions) ?? 0;
  const actionSuccessful = attackStrength > defenseStrength;
  return (
    <Dialog open={true}>
      <DialogTitle>
        Event: Crisis, {props.elephant.MainRegion} invades{" "}
        {props.elephant.TargetRegion}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {attacker.id} strength {attackStrength} against {defender?.id} Empire
          strength {defenseStrength}
        </Typography>
        {actionSuccessful ? (
          <Typography>
            {attacker.id} successfully invades {defender?.id}. Place large
            empire flag on {attacker.id} and remove large empire flag from
            {defender?.id} and replace it with a new small empire flag. Remove
            small empire flags from:{" "}
            {getEmpireDominatedRegionIds(defender.id, props.regions).join(",")}
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
    </Dialog>
  );
};
const EmpireInvadesSovereign = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: () => void;
}) => {
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength =
    (calculateEmpireStrength(defender.id, props.regions) ?? 0) +
    props.event.strength;
  const defenseStrength = defender.towerLevel;
  const actionSuccessful = attackStrength > defenseStrength;
  return (
    <Dialog open={true}>
      <DialogTitle>
        Event: Crisis, {props.elephant.MainRegion} invades{" "}
        {props.elephant.TargetRegion}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {attacker.id} Empire strength {attackStrength} against {defender?.id}{" "}
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
    </Dialog>
  );
};
const DominatedRebelsAgainstEmpire = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: () => void;
  setMainCrisisWon: (won: boolean) => void;
  mainCrisisWon: boolean;
}) => {
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.towerLevel + props.event.strength;
  const defenseStrength = defender.towerLevel;
  const actionSuccessful = attackStrength > defenseStrength;
  return (
    <Dialog open={true}>
      <DialogTitle>
        Event: Crisis, Rebellion in {props.elephant.MainRegion}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {attacker.id} strength {attackStrength} against Empire Capital{" "}
          {defender?.id} strength {defenseStrength}
        </Typography>
        {actionSuccessful ? (
          <Typography>
            {attacker.id} successfully rebels against {defender?.id}. Remove{" "}
            {attacker.id} empire's small flag from {defender.id}. It is now a
            Sovereign region.
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
    </Dialog>
  );
};
const SovereignInvadesCompany = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: () => void;
}) => {
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  const regionsWithUnrest = props.regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength =
    attacker.towerLevel + props.event.strength + defender.unrest;
  return (
    <Dialog open={true}>
      <DialogTitle>
        Event: Crisis, {props.elephant.MainRegion} invades{" "}
        {props.elephant.TargetRegion}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {attacker.id} invades company controlled {defender.id}. The attacking
          strength is {attackStrength}. Exhaust pieces in the{" "}
          {attacker.controllingPresidency} army to mount defense, if the
          newly-mounted pieces do not equal the attack strength the invasion
          succeeds.
        </Typography>
        {regionsWithUnrest.length > 0 && (
          <Typography>
            Invasion triggers rebellions across india: resolve rebellion in{" "}
            {regionsWithUnrest.map((r) => r.id).join(", ")}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
const EmpireInvadesCompany = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: () => void;
}) => {
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  const regionsWithUnrest = props.regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength =
    calculateEmpireStrength(attacker.id, props.regions) +
    props.event.strength +
    defender.unrest;
  return (
    <Dialog open={true}>
      <DialogTitle>
        Event: Crisis, {props.elephant.MainRegion} invades{" "}
        {props.elephant.TargetRegion}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {attacker.id} invades company controlled {defender.id}. The attacking
          strength is {attackStrength}. Exhaust pieces in the{" "}
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
    </Dialog>
  );
};
const CompanyControlledRebels = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: () => void;
}) => {
  const attacker = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const defender = props.regions.find(
    (r) => r.id === props.elephant.TargetRegion
  );

  const regionsWithUnrest = props.regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.unrest + props.event.strength;
  return (
    <Dialog open={true}>
      <DialogTitle>
        Event: Crisis, Rebellion in ${props.elephant.MainRegion}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {attacker.id} rebels against the Company. The attacking strength is{" "}
          {attackStrength}. Exhaust pieces in the{" "}
          {attacker.controllingPresidency} army to mount defense, if the
          newly-mounted pieces do not equal the attack strength the rebellion
          succeeds.
        </Typography>
        {regionsWithUnrest.length > 0 && (
          <Typography>
            Rebellion incites rebellions across other regions: resolve rebellion
            in {regionsWithUnrest.join(", ")}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
