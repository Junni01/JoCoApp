import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  IsEmpireAtMaxSize,
  calculateEmpireStrength,
  doesLossOfRegionCauseEmpireShatter,
  getCrisisType,
  getEmpireDominatedRegionIds,
} from "../Helpers";
import { Region, RegionStatus, CrisisType, Rebellion } from "../Types";
import { useContext, useState } from "react";
import { RebellionInCompanyControlled } from "./Rebellions";
import { GlobalEffectsContext } from "../GlobalEffectsContext";
import { EventDialog } from "../DialogStyles";
import { ElephantsMarch } from "../ElephantsMarch";

export const CrisisEvent = (props: {}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const {
    regions,
    elephant,
    activeEvent,
    executeElephantsMarch,
    discardEvent,
  } = globalEffectsContext;

  const [imperialAmbitions, setImperialAmbitions] = useState<boolean>(false);

  enum Page {
    Crisis,
    ElephantsMarch,
  }

  const [page, setPage] = useState<Page>(Page.Crisis);

  const crisisType = getCrisisType(elephant, regions);
  const renderDialog = () => {
    switch (crisisType) {
      case CrisisType.SovereignInvadesSovereign:
        return (
          <SovereignInvadesSovereign
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );
      case CrisisType.SovereignInvadesDominated:
        return (
          <SovereignInvadesDominated
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );

      case CrisisType.SovereignInvadesEmpireCapital:
        return (
          <SovereignInvadesEmpireCapital
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );
      case CrisisType.EmpireInvadesSovereign:
        return (
          <EmpireInvadesSovereign
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );

      case CrisisType.DominatedRebelsAgainstEmpire:
        return (
          <DominatedRebelsAgainstEmpire
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );
      case CrisisType.EmpireInvadesDominated:
        return (
          <EmpireInvadesDominated
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );
      case CrisisType.EmpireCapitalInvadesEmpireCapital:
        return (
          <EmpireCapitalInvadesEmpireCapital
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );
      case CrisisType.SovereignInvadesCompany:
      case CrisisType.EmpireInvadesCompany:
        return (
          <IndiaInvadesCompany
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );
      case CrisisType.CompanyControlledRebels:
        return (
          <CompanyControlledRebels
            handleDialogConfirm={handleCrisisDialogConfirm}
          />
        );

      default:
        console.error(
          "Crisis Type Switch Case Default: This should not happen"
        );
        return;
    }
  };

  const ElephantsMarchContent = () => {
    return (
      <>
        <DialogContent>
          <Typography>
            <ElephantsMarch imperialAmbitions={imperialAmbitions} />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleElephantsMarchConfirm()}>Ok</Button>
        </DialogActions>
      </>
    );
  };

  const handleCrisisDialogConfirm = (imperialAmbitions: boolean) => {
    setImperialAmbitions(imperialAmbitions);
    setPage(Page.ElephantsMarch);
  };

  const handleElephantsMarchConfirm = () => {
    if (imperialAmbitions) {
      executeElephantsMarch(true);
    } else {
      executeElephantsMarch(false);
    }
    discardEvent();
  };

  return (
    <EventDialog>
      <DialogTitle>
        {page === Page.Crisis
          ? `Event: Crisis (Strength: ${
              activeEvent?.strength ?? "Unknown"
            }, Symbol:${activeEvent?.symbol.toString()}`
          : "Elephants March"}
      </DialogTitle>
      {page === Page.Crisis && renderDialog()}
      {page === Page.ElephantsMarch && <ElephantsMarchContent />}
    </EventDialog>
  );
};

const SovereignInvadesSovereign = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent } = globalEffectsContext;

  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.towerLevel + activeEvent?.strength!;
  const defenseStrength = defender.towerLevel;
  const invasionSuccessful = attackStrength > defenseStrength;

  const executeSovereignInvadesSovereign = () => {
    const newRegions = regions.filter(
      (r) => r.id != attacker.id && r.id != defender.id
    );

    if (invasionSuccessful) {
      attacker.status = RegionStatus.EmpireCapital;
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;
    } else {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    }

    setRegions([...newRegions, attacker, defender]);

    props.handleDialogConfirm(invasionSuccessful);
  };

  return (
    <>
      <DialogContent>
        <Typography>
          {attacker.id} invades {defender.id}
        </Typography>
        <Typography>
          {attacker.id} strength {attackStrength} against {defender.id} strength{" "}
          {defenseStrength}
        </Typography>
        {invasionSuccessful ? (
          <>
            <Typography>
              {attacker.id} successfully invades {defender?.id}. Place large
              empire flag on {attacker.id} and small empire flag on{" "}
              {defender.id}
            </Typography>
            <Typography>
              <ElephantsMarch imperialAmbitions={true} />
            </Typography>
          </>
        ) : (
          <>
            <Typography>
              {attacker.id} fails to invade {defender?.id}.{" "}
              {attacker.towerLevel > 0
                ? `Remove one tower level from ${attacker.id}`
                : ""}
            </Typography>
            <ElephantsMarch imperialAmbitions={false} />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={executeSovereignInvadesSovereign}>Ok</Button>
      </DialogActions>
    </>
  );
};

const SovereignInvadesDominated = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent } = globalEffectsContext;

  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.towerLevel + activeEvent?.strength!;
  const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
  const invasionSuccessful = attackStrength > defenseStrength;

  const defendingEmpireShatters = doesLossOfRegionCauseEmpireShatter(
    defender,
    regions
  );

  const executeSovereignInvadesDominated = () => {
    const defenderDominator = regions.find((r) => r.id === defender.dominator);

    if (!defenderDominator) {
      console.error("EventDialog: Attacked of defender dominator not found!");
      return;
    }

    const newRegions = regions.filter(
      (r) =>
        r.id !== attacker.id &&
        r.id !== defender.id &&
        r.id !== defenderDominator.id
    );

    if (invasionSuccessful) {
      if (defendingEmpireShatters) {
        defenderDominator.status = RegionStatus.Sovereign;
      }
      attacker.status = RegionStatus.EmpireCapital;
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;
    } else {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    }
    setRegions([...newRegions, attacker, defender, defenderDominator]);
    props.handleDialogConfirm(invasionSuccessful);
  };

  return (
    <>
      <DialogContent>
        <Typography>
          {attacker.id} invades {defender.id}
        </Typography>
        <Typography>
          {attacker.id} strength {attackStrength} against {defender?.id}{" "}
          Empire's strength {defenseStrength}
        </Typography>
        {invasionSuccessful ? (
          <>
            <Typography>
              {attacker.id} successfully invades {defender.id}. Place large
              empire flag on {attacker.id} and replace small empire flag on
              {defender.id} with the new empire's flag.
            </Typography>
            {defendingEmpireShatters && (
              <Typography>
                {defender.dominator} Empire shatters: Remove large flag from{" "}
                {defender.dominator}
              </Typography>
            )}
          </>
        ) : (
          <>
            <Typography>
              {attacker.id} fails to invade {defender.id}.{" "}
              {attacker.towerLevel > 0
                ? `Remove one tower level from ${attacker.id}`
                : ""}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={executeSovereignInvadesDominated}>Ok</Button>
      </DialogActions>
    </>
  );
};

const SovereignInvadesEmpireCapital = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent } = globalEffectsContext;

  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.towerLevel + activeEvent?.strength!;
  const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
  const actionSuccessful = attackStrength > defenseStrength;

  const executeSovereignInvadesEmpireCapital = () => {
    const defenderDominatedRegions = regions.filter(
      (r) => r.dominator === defender.id
    );

    const newRegions = regions.filter(
      (r) =>
        r.id != attacker.id &&
        r.id != defender.id &&
        !defenderDominatedRegions.includes(r)
    );

    if (actionSuccessful) {
      attacker.status = RegionStatus.EmpireCapital;
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;

      defenderDominatedRegions.forEach((r) => {
        r.dominator = undefined;
        r.status = RegionStatus.Sovereign;
      });
    } else {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    }

    setRegions([
      ...newRegions,
      attacker,
      defender,
      ...defenderDominatedRegions,
    ]);
    props.handleDialogConfirm(actionSuccessful);
  };

  return (
    <>
      <DialogContent>
        <Typography>
          {attacker.id} invades {defender.id}
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
            {getEmpireDominatedRegionIds(defender.id, regions).join(",")}
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
        <Button onClick={executeSovereignInvadesEmpireCapital}>Ok</Button>
      </DialogActions>
    </>
  );
};

const EmpireInvadesSovereign = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent } = globalEffectsContext;

  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength =
    (calculateEmpireStrength(attacker.id, regions) ?? 0) +
    activeEvent?.strength!;
  const defenseStrength = defender.towerLevel;
  const actionSuccessful = attackStrength > defenseStrength;

  const executeEmpireInvadesSovereign = () => {
    const newRegions = regions.filter(
      (r) => r.id != attacker.id && r.id != defender.id
    );

    const attackStrength =
      (calculateEmpireStrength(attacker.id, regions) ?? 0) +
      (activeEvent?.strength ?? 0);
    const defenseStrength = defender.towerLevel;
    const actionSuccessful = attackStrength > defenseStrength;

    if (actionSuccessful) {
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;
    } else {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    }
    setRegions([...newRegions, attacker, defender]);
    props.handleDialogConfirm(actionSuccessful);
  };

  return (
    <>
      <DialogContent>
        <Typography>
          {attacker.id} invades {defender.id}
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
        <Button onClick={executeEmpireInvadesSovereign}>Ok</Button>
      </DialogActions>
    </>
  );
};

const EmpireInvadesDominated = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent } = globalEffectsContext;

  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength =
    (calculateEmpireStrength(attacker.id, regions) ?? 0) +
    activeEvent?.strength!;
  const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
  const actionSuccessful = attackStrength > defenseStrength;

  const defendingEmpireShatters = doesLossOfRegionCauseEmpireShatter(
    defender,
    regions
  );

  const executeEmpireInvadesDominated = () => {
    const defenderDominator = regions.find((r) => r.id === defender.dominator);

    if (!defenderDominator) {
      console.error("EventDialog: Attacked of defender dominator not found!");
      return;
    }
    const newRegions = regions.filter(
      (r) =>
        r.id !== attacker.id &&
        r.id !== defender.id &&
        r.id !== defenderDominator.id
    );

    if (actionSuccessful) {
      if (defendingEmpireShatters) {
        defenderDominator.status = RegionStatus.Sovereign;
      }
      attacker.status = RegionStatus.EmpireCapital;
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;
    } else {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    }
    setRegions([...newRegions, attacker, defender, defenderDominator]);
    props.handleDialogConfirm(actionSuccessful);
  };

  return (
    <>
      <DialogContent>
        <Typography>
          {elephant.MainRegion} Empire invades {elephant.TargetRegion} which is
          part of {defender.dominator} empire
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
            {defendingEmpireShatters && (
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
        <Button onClick={executeEmpireInvadesDominated}>Ok</Button>
      </DialogActions>
    </>
  );
};

const EmpireCapitalInvadesEmpireCapital = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent } = globalEffectsContext;

  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength =
    (calculateEmpireStrength(attacker.id, regions) ?? 0) +
    activeEvent?.strength!;
  const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
  const actionSuccessful = attackStrength > defenseStrength;

  const executeEmpireCapitalInvadesEmpireCapital = () => {
    const defenderDominatedRegions = regions.filter(
      (r) => r.dominator === defender.id
    );

    const newRegions = regions.filter(
      (r) =>
        r.id != attacker.id &&
        r.id != defender.id &&
        !defenderDominatedRegions.includes(r)
    );

    if (actionSuccessful) {
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;
      defenderDominatedRegions.forEach((r) => {
        r.dominator = undefined;
        r.status = RegionStatus.Sovereign;
      });
    } else {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    }

    setRegions([
      ...newRegions,
      attacker,
      defender,
      ...defenderDominatedRegions,
    ]);
    props.handleDialogConfirm(actionSuccessful);
  };

  return (
    <>
      <DialogContent>
        <Typography>
          {attacker.id} Empire invades {defender.id} Empire Capital
        </Typography>
        <Typography>
          {attacker.id} Empire strength {attackStrength} against {defender.id}{" "}
          empire strength {defenseStrength}
        </Typography>
        {actionSuccessful ? (
          <>
            <Typography>
              {attacker.id} successfully invades {defender?.id}. Place{" "}
              {attacker.id} empire's small flag on {defender.id}
            </Typography>
            <Typography>
              {defender.id} Empire shatters: Remove large flag from{" "}
              {defender.id} and remove small empire flags from:{" "}
              {getEmpireDominatedRegionIds(defender.id, regions).join(",")}
            </Typography>
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
        <Button onClick={executeEmpireCapitalInvadesEmpireCapital}>Ok</Button>
      </DialogActions>
    </>
  );
};

const DominatedRebelsAgainstEmpire = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent } = globalEffectsContext;

  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }

  const attackStrength = attacker.towerLevel + activeEvent?.strength!;
  const defenseStrength = defender.towerLevel;
  const actionSuccessful = attackStrength > defenseStrength;

  const targetEmpireShatters = doesLossOfRegionCauseEmpireShatter(
    attacker,
    regions
  );

  const executeDominatedRebelsAgainstEmpire = () => {
    const newRegions = regions.filter(
      (r) => r.id != attacker.id && r.id != defender.id
    );

    if (actionSuccessful) {
      if (targetEmpireShatters) {
        defender.status = RegionStatus.Sovereign;
      }
      attacker.status = RegionStatus.Sovereign;
      attacker.dominator = undefined;
    } else {
      if (defender.towerLevel > 0) {
        defender.towerLevel = defender.towerLevel - 1;
      }
    }
    setRegions([...newRegions, attacker, defender]);
    props.handleDialogConfirm(false);
  };

  return (
    <>
      <DialogContent>
        <Typography>
          {attacker.id} rebels against its dominator {defender.id}
        </Typography>
        <Typography>
          {attacker.id} strength {attackStrength} against Empire Capital{" "}
          {defender?.id} strength {defenseStrength}
        </Typography>
        {actionSuccessful ? (
          <>
            <Typography>
              {attacker.id} successfully rebels against {defender?.id}. Remove{" "}
              {defender.id} empire's small flag from {attacker.id}. It is now a
              Sovereign region.
            </Typography>
            <Typography>
              Close every open order in {attacker.id}. If all are already
              closed, resolve a Cascade.
            </Typography>
            {targetEmpireShatters && (
              <Typography>
                {defender.id} Empire shatters: Remove large flag from{" "}
                {defender.id}
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
        <Button onClick={executeDominatedRebelsAgainstEmpire}>Ok</Button>
      </DialogActions>
    </>
  );
};

const IndiaInvadesCompany = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent, globalEffects } =
    globalEffectsContext;
  const [mainCrisisWon, setMainCrisisWon] = useState<boolean>(false);
  const [mainCrisisResolved, setMainCrisisResolved] = useState<boolean>(false);
  const [showMainCrisisResults, setShowMainCrisisResults] =
    useState<boolean>(false);

  const [rebellionOutcomes, setRebellionOutcomes] = useState<Rebellion[]>([]);
  const [rebellionIndex, setRebellionIndex] = useState<number>(0);

  const attacker = regions.find((r) => r.id === elephant.MainRegion);
  const defender = regions.find((r) => r.id === elephant.TargetRegion);

  if (!attacker || !defender) {
    console.error("EventDialog: Attacked of defender not found!");
    return;
  }
  const regionsWithUnrest = regions.filter(
    (r) =>
      r.status === RegionStatus.CompanyControlled &&
      r.unrest > 0 &&
      r.id !== defender.id
  );

  console.log("regions with unrest", regionsWithUnrest);

  const unrestStrength = globalEffects.SepoyRecruitment
    ? defender.unrest * 2
    : defender.unrest;

  const attackStrength =
    attacker.status === RegionStatus.EmpireCapital
      ? calculateEmpireStrength(attacker.id, regions) +
        (activeEvent?.strength ?? 0) +
        unrestStrength
      : attacker.towerLevel + (activeEvent?.strength ?? 0) + unrestStrength;

  const executeIndiaInvadesCompany = () => {
    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

    if (mainCrisisWon) {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    } else {
      attacker.status = RegionStatus.EmpireCapital;
      defender.status = RegionStatus.Dominated;
      defender.controllingPresidency = undefined;
      defender.dominator = attacker.id;
      defender.towerLevel = 1;
      defender.unrest = 0;
    }

    const rebellionRegions: Region[] = [];

    for (const rebellion of rebellionOutcomes) {
      const region = regions.find((r) => r.id === rebellion.Region.id);

      if (!region) {
        console.error("Region not found in regions array");
        return;
      }
      if (!rebellion.RebellionSuppressed) {
        region.status = RegionStatus.Sovereign;
        region.controllingPresidency = undefined;
        region.towerLevel = 1;
      } else {
        region.unrest = 0;
      }
      rebellionRegions.push(region);
    }

    const newRegionArray = regions.filter(
      (r) =>
        !rebellionRegions.includes(r) &&
        r.id !== attacker.id &&
        r.id !== defender.id
    );

    setRegions([...newRegionArray, ...rebellionRegions, attacker, defender]);

    props.handleDialogConfirm(!mainCrisisWon);
  };

  const [activeRebellionRegion, setActiveRebellionRegion] =
    useState<Region>(defender);

  const handleRebellionResolution = (rebellionSuppressed: boolean) => {
    setRebellionOutcomes([
      ...rebellionOutcomes,
      {
        Region: activeRebellionRegion,
        RebellionSuppressed: rebellionSuppressed,
      },
    ]);

    const newRebellionIndex = rebellionIndex + 1;

    if (newRebellionIndex === regionsWithUnrest.length) {
      executeIndiaInvadesCompany();
    } else {
      setActiveRebellionRegion(regionsWithUnrest[newRebellionIndex]);
      setRebellionIndex(newRebellionIndex);
    }
  };

  const getRebellionStrength = () => {
    return globalEffectsContext.globalEffects.SepoyRecruitment
      ? activeRebellionRegion.unrest * 2
      : activeRebellionRegion.unrest;
  };

  const handleMainCrisisShowResults = (mainCrisisWon: boolean) => {
    if (!mainCrisisWon) {
      globalEffectsContext.setGlobalEffects({
        ...globalEffectsContext.globalEffects,
        RegionsLost: globalEffectsContext.globalEffects.RegionsLost + 1,
      });
    }

    setMainCrisisWon(mainCrisisWon);
    setShowMainCrisisResults(true);
  };

  const handleMainCrisisDone = () => {
    setShowMainCrisisResults(false);
    setMainCrisisResolved(true);

    if (regionsWithUnrest.length === 0) {
      executeIndiaInvadesCompany();
    } else {
      setActiveRebellionRegion(regionsWithUnrest[0]);
    }
  };

  return (
    <>
      {!mainCrisisResolved &&
        (showMainCrisisResults ? (
          <>
            <Typography>
              {elephant.MainRegion} invades {elephant.TargetRegion}
            </Typography>
            <InvasionToCompanyControlledResults
              invasionPrevented={mainCrisisWon}
              invadedRegion={defender}
              onOk={handleMainCrisisDone}
            />
          </>
        ) : (
          <>
            <Typography>
              {elephant.MainRegion} invades {elephant.TargetRegion}
            </Typography>
            <DialogContent>
              <Typography>
                {attacker.id} invades company controlled {defender.id}. The
                attacking strength is {attackStrength}. Exhaust pieces in the{" "}
                {attacker.controllingPresidency} army to mount defense, if the
                newly-mounted pieces do not equal the attack strength the
                invasion succeeds.
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
        ))}
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
  invasionPrevented: boolean;
  onOk: () => void;
  invadedRegion: Region;
}) => {
  if (!props.invasionPrevented) {
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
          <Typography>Attack on {props.invadedRegion.id} defeated</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOk}>ok</Button>
        </DialogActions>
      </>
    );
  }
};

const CompanyControlledRebels = (props: {
  handleDialogConfirm: (imperialAmbition: boolean) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, setRegions, activeEvent } = globalEffectsContext;

  const rebellingRegion = regions.find((r) => r.id === elephant.MainRegion);
  const regionsWithUnrest = regions.filter(
    (r) =>
      r.status === RegionStatus.CompanyControlled &&
      r.unrest > 0 &&
      r.id !== rebellingRegion?.id
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
    if (!rebellionSuppressed) {
      globalEffectsContext.setGlobalEffects({
        ...globalEffectsContext.globalEffects,
        RegionsLost: globalEffectsContext.globalEffects.RegionsLost + 1,
      });
    }

    setRebellionOutcomes([
      ...rebellionOutcomes,
      {
        Region: activeRebellionRegion,
        RebellionSuppressed: rebellionSuppressed,
      },
    ]);

    console.log("rebellionIndex", rebellionIndex);
    console.log("regionsWithUnrest.length", regionsWithUnrest.length);
    if (rebellionIndex + 1 > regionsWithUnrest.length) {
      console.log("what");
      executeCompanyControlledRebels();
    } else {
      setActiveRebellionRegion(regionsWithUnrest[rebellionIndex]);
      setRebellionIndex(rebellionIndex + 1);
    }
  };

  const getRebellionStrength = () => {
    const unrestStrength = globalEffectsContext.globalEffects.SepoyRecruitment
      ? activeRebellionRegion.unrest * 2
      : activeRebellionRegion.unrest;

    return rebellionIndex === 0
      ? unrestStrength + (activeEvent?.strength ?? 0)
      : unrestStrength;
  };

  const executeCompanyControlledRebels = () => {
    const rebellionRegions: Region[] = [];

    for (const rebellion of rebellionOutcomes) {
      const region = regions.find((r) => r.id === rebellion.Region.id);

      if (!region) {
        console.error("Region not found in regions array");
        return;
      }
      if (!rebellion.RebellionSuppressed) {
        region.status = RegionStatus.Sovereign;
        region.controllingPresidency = undefined;
        region.towerLevel = 1;
      } else {
        region.unrest = 0;
      }
      rebellionRegions.push(region);
    }

    const newRegionArray = regions.filter((r) => !rebellionRegions.includes(r));

    setRegions([...newRegionArray, ...rebellionRegions]);
    props.handleDialogConfirm(false);
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
