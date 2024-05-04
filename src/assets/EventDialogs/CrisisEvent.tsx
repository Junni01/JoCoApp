import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
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
import { RebellionInCompanyControlled } from "./Rebellions";

export const CrisisEvent = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  onOk: (primaryCrisisWon: boolean, rebellions: Rebellion[]) => void;
}) => {
  const handleCompanyControlledRebels = (rebellions: Rebellion[]) => {
    props.onOk(false, rebellions);
  };

  const crisisType = getCrisisType(props.elephant, props.regions);
  const renderDialog = () => {
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
          <IndiaInvadesCompany
            regions={props.regions}
            elephant={props.elephant}
            event={props.event}
            attackerIsEmpire={false}
            onOk={props.onOk}
          />
        );

      case CrisisType.EmpireInvadesCompany:
        return (
          <IndiaInvadesCompany
            regions={props.regions}
            elephant={props.elephant}
            event={props.event}
            attackerIsEmpire={true}
            onOk={props.onOk}
          />
        );

      case CrisisType.CompanyControlledRebels:
        return (
          <CompanyControlledRebels
            regions={props.regions}
            elephant={props.elephant}
            event={props.event}
            handleConfirmResults={() => handleCompanyControlledRebels}
          />
        );
      case CrisisType.EmpireInvadesDominated:
        return (
          <EmpireInvadesDominated
            regions={props.regions}
            elephant={props.elephant}
            event={props.event}
            onOk={() => props.onOk(false, [])}
          />
        );

      default:
        console.error(
          "Crisis Type Switch Case Default: This should not happen"
        );
        return;
    }
  };
  return (
    <Dialog open={true}>
      <DialogTitle>
        Event: Crisis (Strength: {props.event.strength}, Symbol:{" "}
        {props.event.symbol.toString()})
      </DialogTitle>
      {renderDialog()}
    </Dialog>
  );
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
    <>
      <DialogContent>
        <Typography>
          {props.elephant.MainRegion} invades {props.elephant.TargetRegion}
        </Typography>
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
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </>
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
    <>
      <DialogContent>
        <Typography>
          {props.elephant.MainRegion} invades {props.elephant.TargetRegion}
        </Typography>
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
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </>
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
    <>
      <DialogContent>
        <Typography>
          {props.elephant.MainRegion} invades {props.elephant.TargetRegion}
        </Typography>
        <Typography>
          {attacker.id} strength {attackStrength} against {defender?.id} Empire
          strength {defenseStrength}
        </Typography>
        {actionSuccessful ? (
          <Typography>
            {attacker.id} successfully invades {defender?.id}. Place large
            empire flag on {attacker.id} and remove large empire flag from
            {defender?.id} and replace it with a new small empire flag. Empire
            Shatters : Remove small empire flags from:{" "}
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
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </>
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
    (calculateEmpireStrength(attacker.id, props.regions) ?? 0) +
    props.event.strength;
  const defenseStrength = defender.towerLevel;
  const actionSuccessful = attackStrength > defenseStrength;
  return (
    <>
      <DialogContent>
        <Typography>
          {props.elephant.MainRegion} invades {props.elephant.TargetRegion}
        </Typography>
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
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </>
  );
};

const EmpireInvadesDominated = (props: {
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
    (calculateEmpireStrength(attacker.id, props.regions) ?? 0) +
    props.event.strength;
  const defenseStrength =
    calculateEmpireStrength(defender.id, props.regions) ?? 0;
  const actionSuccessful = attackStrength > defenseStrength;
  return (
    <>
      <DialogContent>
        <Typography>
          {props.elephant.MainRegion} Empire invades{" "}
          {props.elephant.TargetRegion} which is part of {defender.dominator}{" "}
          empire
        </Typography>
        <Typography>
          {attacker.id} Empire strength {attackStrength} against{" "}
          {defender.dominator} empire strength {defenseStrength}
        </Typography>
        {actionSuccessful ? (
          <>
            <Typography>
              {attacker.id} successfully invades {defender?.id}. Place{" "}
              {attacker.id} empire's small flag on {defender.id}
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
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </>
  );
};

const DominatedRebelsAgainstEmpire = (props: {
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
  const defenseStrength = defender.towerLevel;
  const actionSuccessful = attackStrength > defenseStrength;
  return (
    <>
      <DialogContent>
        <Typography>Rebellion in {props.elephant.MainRegion}</Typography>
        <Typography>
          {attacker.id} strength {attackStrength} against Empire Capital{" "}
          {defender?.id} strength {defenseStrength}
        </Typography>
        {actionSuccessful ? (
          <>
            <Typography>
              {attacker.id} successfully rebels against {defender?.id}. Remove{" "}
              {attacker.id} empire's small flag from {defender.id}. It is now a
              Sovereign region.
            </Typography>
            {doesEmpireShatter(attacker, props.regions) && (
              <Typography>
                {defender.dominator} Empire shatters: Remove large flag from{" "}
                {defender.dominator}
              </Typography>
            )}
          </>
        ) : (
          <Typography>
            {attacker.id} fails to rebels against {defender?.id}.
            {attacker.towerLevel > 0
              ? `The empire is left weakened by the rebellion. Remove one tower level from ${defender.id}`
              : ""}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </>
  );
};
const IndiaInvadesCompany = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  attackerIsEmpire: boolean;
  onOk: (mainCrisisWon: boolean, rebellionResults: Rebellion[]) => void;
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

  const attackStrength = props.attackerIsEmpire
    ? calculateEmpireStrength(attacker.id, props.regions) +
      props.event.strength +
      defender.unrest
    : attacker.towerLevel + props.event.strength + defender.unrest;

  const [mainCrisisWon, setMainCrisisWon] = useState<boolean>(false);
  const [mainCrisisResolved, setMainCrisisResolved] = useState<boolean>(false);
  const [showMainCrisisResults, setShowMainCrisisResults] =
    useState<boolean>(false);
  const [activeRebellionRegion, setActiveRebellionRegion] =
    useState<Region>(defender);
  const [rebellionOutcomes, setRebellionOutcomes] = useState<Rebellion[]>([]);
  const [rebellionIndex, setRebellionIndex] = useState<number>(1);

  const handleRebellionResolution = (rebellionSuppressed: boolean) => {
    setRebellionOutcomes([
      ...rebellionOutcomes,
      {
        Region: activeRebellionRegion,
        RebellionSuppressed: rebellionSuppressed,
      },
    ]);

    if (rebellionIndex + 1 > regionsWithUnrest.length) {
      props.onOk(mainCrisisWon, rebellionOutcomes);
    } else {
      setActiveRebellionRegion(regionsWithUnrest[rebellionIndex]);
      setRebellionIndex(rebellionIndex + 1);
    }
  };

  const getRebellionStrength = () => {
    return activeRebellionRegion.unrest;
  };

  const handleMainCrisisShowResults = (mainCrisisWon: boolean) => {
    if (regionsWithUnrest.length === 0) {
      props.onOk(mainCrisisWon, []);
    } else {
      setMainCrisisWon(mainCrisisWon);
      setShowMainCrisisResults(true);
    }
  };

  const handleMainCrisisDone = () => {
    setShowMainCrisisResults(false);
    setMainCrisisResolved(true);
  };

  return (
    <>
      {!mainCrisisResolved && showMainCrisisResults ? (
        <>
          <Typography>
            {props.elephant.MainRegion} invades {props.elephant.TargetRegion}
          </Typography>
          <InvasionToCompanyControlledResults
            invasionSuccessful={mainCrisisWon}
            invadedRegion={defender}
            onOk={handleMainCrisisDone}
          />
        </>
      ) : (
        <>
          <Typography>
            Event: Crisis, {props.elephant.MainRegion} invades{" "}
            {props.elephant.TargetRegion}
          </Typography>
          <DialogContent>
            <Typography>
              {attacker.id} invades company controlled {defender.id}. The
              attacking strength is {attackStrength}. Exhaust pieces in the{" "}
              {attacker.controllingPresidency} army to mount defense, if the
              newly-mounted pieces do not equal the attack strength the invasion
              succeeds.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleMainCrisisShowResults(true)}>
              Invasion Defended
            </Button>
            <Button onClick={() => handleMainCrisisShowResults(false)}>
              Invasion Successful
            </Button>
          </DialogActions>
        </>
      )}
      {mainCrisisResolved && (
        <>
          <Typography>Rebellion in {activeRebellionRegion.id}</Typography>
          <RebellionInCompanyControlled
            rebellionStrength={getRebellionStrength()}
            rebellingRegion={activeRebellionRegion}
            setRebellionOutcome={handleRebellionResolution}
          />
        </>
      )}
    </>
  );
};

const InvasionToCompanyControlledResults = (props: {
  invasionSuccessful: boolean;
  onOk: () => void;
  invadedRegion: Region;
}) => {
  if (props.invasionSuccessful) {
    return (
      <>
        <DialogContent>
          <Typography>Attack on {props.invadedRegion.id} successful</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOk}>ok</Button>
        </DialogActions>
      </>
    );
  } else {
    return (
      <>
        <DialogContent>
          <Typography>Attack on {props.invadedRegion.id} successful</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOk}>ok</Button>
        </DialogActions>
      </>
    );
  }
};

const CompanyControlledRebels = (props: {
  regions: Region[];
  elephant: Elephant;
  event: EventCard;
  handleConfirmResults: (rebellionResults: Rebellion[]) => void;
}) => {
  const rebellingRegion = props.regions.find(
    (r) => r.id === props.elephant.MainRegion
  );
  const regionsWithUnrest = props.regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  if (!rebellingRegion) {
    console.error(
      "EventDialog: rebelling company controlled region not found!"
    );
    return;
  }

  const [activeRebellionRegion, setActiveRebellionRegion] =
    useState<Region>(rebellingRegion);
  const [rebellionOutcomes, setRebellionOutcomes] = useState<Rebellion[]>([]);
  const [rebellionIndex, setRebellionIndex] = useState<number>(0);

  const handleRebellionResolution = (rebellionSuppressed: boolean) => {
    setRebellionOutcomes([
      ...rebellionOutcomes,
      {
        Region: activeRebellionRegion,
        RebellionSuppressed: rebellionSuppressed,
      },
    ]);

    if (rebellionIndex + 1 > regionsWithUnrest.length) {
      props.handleConfirmResults(rebellionOutcomes);
    } else {
      setActiveRebellionRegion(regionsWithUnrest[rebellionIndex]);
      setRebellionIndex(rebellionIndex + 1);
    }
  };

  const getRebellionStrength = () => {
    return rebellionIndex === -1
      ? activeRebellionRegion.unrest + props.event.strength
      : activeRebellionRegion.unrest;
  };
  return (
    <>
      <Typography>Rebellion in {activeRebellionRegion.id}</Typography>
      <RebellionInCompanyControlled
        rebellionStrength={getRebellionStrength()}
        rebellingRegion={activeRebellionRegion}
        setRebellionOutcome={handleRebellionResolution}
      />
    </>
  );
};