import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {
  CrisisType,
  DeployType,
  Elephant,
  EventCard,
  EventType,
  Presidency,
  Rebellion,
  Region,
  RegionName,
  RegionStatus,
  Scenario,
} from "./Types";
import { getElephantInitialPosition, getRegionData } from "./Data";
import { useContext, useState } from "react";
import { DeployDialog } from "./Deploy/DeployDialog";
import { ModifyRegionDialog } from "./ModifyRegionDialog";
import {
  calculateEmpireStrength,
  doesLossOfRegionCauseEmpireShatter,
  getCrisisType,
  marchElephant,
  shuffleEventPile,
} from "./Helpers";
import { ShuffleEvent } from "./EventDialogs/ShuffleEvent";
import { WindfallEvent } from "./EventDialogs/WindfallEvent";
import { TurmoilEvent } from "./EventDialogs/TurmoilEvent";
import { LeaderEvent } from "./EventDialogs/LeaderEvent";
import { PeaceEvent } from "./EventDialogs/PeaceEvent";
import { CrisisEvent } from "./EventDialogs/CrisisEvent";
import { RegionCard } from "./RegionCard";
import { ElephantCard } from "./ElephantCard";
import { GlobalEffectsDialog } from "./GlobalEffectsDialog";
import { GlobalEffectsContext } from "./GlobalEffectsContext";
import { ForeignInvasionEvent } from "./EventDialogs/ForeignInvasionEvent";
import { EventStack } from "./EventStack";

export const IndiaMap = (props: {
  scenario: Scenario;
  initialEventDeck: EventCard[];
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const regions = globalEffectsContext.regions;
  const elephant = globalEffectsContext.elephant;
  const eventDeck = globalEffectsContext.eventDeck;
  const eventDiscardPile = globalEffectsContext.eventDiscardPile;
  const drawStackRegion = globalEffectsContext.drawStackRegion;
  const setRegions = globalEffectsContext.setRegions;
  const setElephant = globalEffectsContext.setElephant;
  const setEvenDeck = globalEffectsContext.setEventDeck;
  const setEventDiscardPile = globalEffectsContext.setEventDiscardPile;
  const activeEvent = globalEffectsContext.activeEvent;
  const setActiveEvent = globalEffectsContext.setActiveEvent;
  const executeElephantsMarch = globalEffectsContext.executeElephantsMarch;
  const discardEvent = globalEffectsContext.discardEvent;

  const [showEventDialog, setShowEventDialog] = useState<boolean>(false);
  const [showDeployDialog, setShowDeployDialog] = useState<boolean>(false);
  const [showGlobalEffectsDialog, setShowGlobalEffectsDialog] =
    useState<boolean>(false);
  const [showModifyRegionDialog, setShowModifyRegionDialog] =
    useState<boolean>(false);
  const [activeRegion, setActiveRegion] = useState<Region>();

  console.log(eventDeck);

  const handleDeployButtonClick = (region: Region | undefined) => {
    if (!region) {
      return;
    }
    setActiveRegion(region);
    setShowDeployDialog(true);
  };

  const handleDeployDialogCancel = () => {
    setActiveRegion(undefined);
    setShowDeployDialog(false);
  };

  const handleSuccessfulDeployToCompanyControlledRegion = (
    deployingPresidency: Presidency
  ) => {
    if (!activeRegion) {
      console.error(
        "handleSuccessfulDeployToCompanyControlledRegion: Active Region is Undefined!"
      );
      return;
    }

    if (deployingPresidency !== activeRegion.controllingPresidency) {
      console.error(
        "handleSuccessfulDeployToCompanyControlledRegion: The deploying residency is not the one controlling this region!"
      );
      return;
    }

    const newRegionArray = regions.filter((r) => r.id !== activeRegion.id);
    activeRegion.unrest = 0;
    setRegions([...newRegionArray, activeRegion]);
  };

  const handleSuccessfulDeployToDominatedRegion = (
    deployingPresidency: Presidency
  ) => {
    if (!activeRegion) {
      console.error(
        "handleSuccessfulDeployToDominatedRegion: Active Region is Undefined!"
      );
      return;
    }

    const dominator = regions.find((r) => r.id === activeRegion.dominator);

    if (!dominator) {
      console.error(
        "handleSuccessfulDeployToDominatedRegion: Dominator is undefined!"
      );
      return;
    }

    if (doesLossOfRegionCauseEmpireShatter(activeRegion, regions)) {
      dominator.status = RegionStatus.Sovereign;
    }

    const newRegionArray = regions.filter(
      (r) => r.id !== activeRegion.id && r.id !== dominator?.id
    );
    activeRegion.unrest = 0;
    activeRegion.lootAvailable = false;
    activeRegion.status = RegionStatus.CompanyControlled;
    activeRegion.towerLevel = 0;
    activeRegion.dominator = undefined;
    activeRegion.controllingPresidency = deployingPresidency;

    setRegions([...newRegionArray, activeRegion, dominator]);
  };

  const handleSuccessfulDeployToSovereignRegion = (
    deployingPresidency: Presidency
  ) => {
    if (!activeRegion) {
      console.error(
        "handleSuccessfulDeployToSovereignRegion: active Region is undefined!"
      );
      return;
    }
    const newRegionArray = regions.filter((r) => r.id !== activeRegion.id);
    activeRegion.unrest = 0;
    activeRegion.lootAvailable = false;
    activeRegion.status = RegionStatus.CompanyControlled;
    activeRegion.towerLevel = 0;
    activeRegion.controllingPresidency = deployingPresidency;
    setRegions([...newRegionArray, activeRegion]);
  };

  const handleSuccessfulDeployToCapitalRegion = (
    deployingPresidency: Presidency
  ) => {
    if (!activeRegion) {
      console.error(
        "handleSuccessfulDeployToCapitalRegion: active Region is undefined!"
      );
      return;
    }
    const dominatedRegions = regions.filter(
      (r) => r.dominator === activeRegion.id
    );

    activeRegion.unrest = 0;
    activeRegion.lootAvailable = false;
    activeRegion.status = RegionStatus.CompanyControlled;
    activeRegion.towerLevel = 0;
    activeRegion.dominator = undefined;
    activeRegion.controllingPresidency = deployingPresidency;
    const newRegionArray = regions.filter(
      (r) => r.id !== activeRegion.id && !dominatedRegions.includes(r)
    );

    const modifiedDominatedRegions: Region[] = [];

    for (const region of dominatedRegions) {
      region.dominator = undefined;
      region.status = RegionStatus.Sovereign;
      modifiedDominatedRegions.push(region);
    }

    setRegions([...newRegionArray, ...modifiedDominatedRegions, activeRegion]);
  };

  const deployRedirectElephant = () => {
    if (
      elephant.MainRegion === activeRegion?.id &&
      elephant.TargetRegion !== undefined
    ) {
      setElephant({ MainRegion: activeRegion.id, TargetRegion: undefined });
    }
  };

  const handleDeployConfirm = (
    type: DeployType,
    success: boolean,
    deployingPresidency: Presidency
  ) => {
    if (success) {
      switch (type) {
        case DeployType.CompanyControlledWithUnrest:
        case DeployType.CompanyControlledWithoutUnrest:
          handleSuccessfulDeployToCompanyControlledRegion(deployingPresidency);
          break;
        case DeployType.Dominated:
          handleSuccessfulDeployToDominatedRegion(deployingPresidency);
          break;
        case DeployType.Sovereign:
          handleSuccessfulDeployToSovereignRegion(deployingPresidency);
          break;
        case DeployType.EmpireCapital:
          handleSuccessfulDeployToCapitalRegion(deployingPresidency);
          break;
        default:
          console.error("DeployType not found");
      }
      deployRedirectElephant();
    }

    setActiveRegion(undefined);
    setShowDeployDialog(false);
  };

  const handleModifyRegionClick = (region: Region | undefined) => {
    if (!region) {
      return;
    }
    setActiveRegion(region);
    setShowModifyRegionDialog(true);
  };

  const handleModifyRegionCancel = () => {
    setActiveRegion(undefined);
    setShowModifyRegionDialog(false);
  };

  const handleModifyRegionSave = (region: Region) => {
    const newRegionArray = regions.filter((r) => r.id !== region.id);
    setRegions([...newRegionArray, region]);
    setActiveRegion(undefined);
    setShowModifyRegionDialog(false);
  };

  const executeLeaderEvent = (rebellionOutcomes: Rebellion[]) => {
    if (
      drawStackRegion.status === RegionStatus.Sovereign ||
      drawStackRegion.status === RegionStatus.EmpireCapital
    ) {
      const newRegionArray = regions.filter((r) => r.id !== drawStackRegion.id);
      drawStackRegion.towerLevel++;
      setRegions([...newRegionArray, drawStackRegion]);
    }

    if (drawStackRegion.status === RegionStatus.Dominated) {
      const rebellingRegion = regions.find((r) => r.id === drawStackRegion.id);
      const dominator = regions.find((r) => r.id === drawStackRegion.dominator);

      if (!dominator || !rebellingRegion) {
        console.error(
          "executeLeaderEvent: rebelling region or Dominator for dominated region not found!"
        );
        return;
      }

      const rebellionStrength =
        rebellingRegion.towerLevel + (activeEvent?.strength ?? 0);
      const dominatorStrength = dominator.towerLevel;
      const rebellionSuccessful = rebellionStrength > dominatorStrength;

      const newRegionArray = regions.filter(
        (r) => r.id !== rebellingRegion.id && r.id !== dominator.id
      );

      if (rebellionSuccessful) {
        if (doesLossOfRegionCauseEmpireShatter(rebellingRegion, regions)) {
          dominator.status = RegionStatus.Sovereign;
        }
        rebellingRegion.status = RegionStatus.Sovereign;
        rebellingRegion.dominator = undefined;
      } else {
        if (dominator.towerLevel > 0) {
          dominator.towerLevel = dominator.towerLevel - 1;
        }
      }

      setRegions([...newRegionArray, rebellingRegion, dominator]);
    }

    if (drawStackRegion.status === RegionStatus.CompanyControlled) {
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
        (r) => !rebellionRegions.includes(r)
      );

      setRegions([...newRegionArray, ...rebellionRegions]);
      executeElephantsMarch(false);
    }

    discardEvent();
    setActiveEvent(undefined);
    setShowEventDialog(false);
  };

  const executeCrisisEvent = (
    mainCrisisWon: boolean,
    rebellions: Rebellion[]
  ) => {
    const crisisType = getCrisisType(elephant, regions);

    switch (crisisType) {
      case CrisisType.SovereignInvadesSovereign:
        executeSovereignInvadesSovereign();
        break;
      case CrisisType.SovereignInvadesDominated:
        executeSovereignInvadesDominated();
        break;
      case CrisisType.SovereignInvadesEmpireCapital:
        executeSovereignInvadesEmpireCapital();
        break;
      case CrisisType.EmpireInvadesSovereign:
        executeEmpireInvadesSovereign();
        break;
      case CrisisType.DominatedRebelsAgainstEmpire:
        executeDominatedRebelsAgainstEmpire();
        break;
      case CrisisType.SovereignInvadesCompany:
        executeSovereignInvadesCompany(mainCrisisWon, rebellions);
        break;
      case CrisisType.EmpireInvadesCompany:
        executeEmpireInvadesCompany(mainCrisisWon, rebellions);
        break;
      case CrisisType.CompanyControlledRebels:
        executeCompanyControlledRebels(rebellions);
        break;
      case CrisisType.EmpireInvadesDominated:
        executeEmpireInvadesDominated();
        break;
      case CrisisType.EmpireCapitalInvadesEmpireCapital:
        executeEmpireCapitalInvadesEmpireCapital();
        break;
      default:
        console.error(
          "Crisis Type Switch Case Default: This should not happen"
        );
    }
    discardEvent();
    setActiveEvent(undefined);
    setShowEventDialog(false);
  };

  const executeSovereignInvadesSovereign = () => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

    const newRegions = regions.filter(
      (r) => r.id != attacker.id && r.id != defender.id
    );

    const attackStrength = attacker.towerLevel + (activeEvent?.strength ?? 0);
    const defenseStrength = defender.towerLevel;
    const actionSuccessful = attackStrength > defenseStrength;
    if (actionSuccessful) {
      attacker.status = RegionStatus.EmpireCapital;
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;
    } else {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    }

    setRegions([...newRegions, attacker, defender]);

    if (actionSuccessful) {
      executeElephantsMarch(true);
    } else {
      executeElephantsMarch(false);
    }
  };

  const executeSovereignInvadesDominated = () => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

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

    const attackStrength = attacker.towerLevel + (activeEvent?.strength ?? 0);
    const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
    const actionSuccessful = attackStrength > defenseStrength;

    if (actionSuccessful) {
      if (doesLossOfRegionCauseEmpireShatter(defender, regions)) {
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

    if (actionSuccessful) {
      executeElephantsMarch(true);
    } else {
      executeElephantsMarch(false);
    }
  };

  const executeSovereignInvadesEmpireCapital = () => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

    const defenderDominatedRegions = regions.filter(
      (r) => r.dominator === defender.id
    );

    const newRegions = regions.filter(
      (r) =>
        r.id != attacker.id &&
        r.id != defender.id &&
        !defenderDominatedRegions.includes(r)
    );

    const attackStrength = attacker.towerLevel + (activeEvent?.strength ?? 0);
    const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
    const actionSuccessful = attackStrength > defenseStrength;

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

    if (actionSuccessful) {
      executeElephantsMarch(true);
    } else {
      executeElephantsMarch(false);
    }
  };

  const executeEmpireInvadesSovereign = () => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

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

    if (actionSuccessful) {
      executeElephantsMarch(true);
    } else {
      executeElephantsMarch(false);
    }
  };

  const executeDominatedRebelsAgainstEmpire = () => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

    const attackStrength = attacker.towerLevel + (activeEvent?.strength ?? 0);
    const defenseStrength = defender.towerLevel;
    const actionSuccessful = attackStrength > defenseStrength;

    const newRegions = regions.filter(
      (r) => r.id != attacker.id && r.id != defender.id
    );

    if (actionSuccessful) {
      if (doesLossOfRegionCauseEmpireShatter(attacker, regions)) {
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
    executeElephantsMarch(false);
  };

  const executeSovereignInvadesCompany = (
    majorCrisisWon: boolean,
    additionalRebellions: Rebellion[]
  ) => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

    if (majorCrisisWon) {
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

    for (const rebellion of additionalRebellions) {
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

    if (majorCrisisWon) {
      executeElephantsMarch(false);
    } else {
      executeElephantsMarch(true);
    }
  };

  const executeEmpireInvadesCompany = (
    majorCrisisWon: boolean,
    additionalRebellions: Rebellion[]
  ) => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

    if (majorCrisisWon) {
      if (attacker.towerLevel > 0) {
        attacker.towerLevel = attacker.towerLevel - 1;
      }
    } else {
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;
      defender.controllingPresidency = undefined;
      defender.towerLevel = 1;
      defender.unrest = 0;
    }

    const rebellionRegions: Region[] = [];

    for (const rebellion of additionalRebellions) {
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

    if (majorCrisisWon) {
      executeElephantsMarch(false);
    } else {
      executeElephantsMarch(true);
    }
  };

  const executeCompanyControlledRebels = (
    additionalRebellions: Rebellion[]
  ) => {
    const rebellionRegions: Region[] = [];

    for (const rebellion of additionalRebellions) {
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
    executeElephantsMarch(false);
  };

  const executeEmpireInvadesDominated = () => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

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

    const attackStrength =
      calculateEmpireStrength(attacker.id, regions) +
      (activeEvent?.strength ?? 0);
    const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
    const actionSuccessful = attackStrength > defenseStrength;

    if (actionSuccessful) {
      if (doesLossOfRegionCauseEmpireShatter(defender, regions)) {
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

    if (actionSuccessful) {
      executeElephantsMarch(true);
    } else {
      executeElephantsMarch(false);
    }
  };

  const executeEmpireCapitalInvadesEmpireCapital = () => {
    const attacker = regions.find((r) => r.id === elephant.MainRegion);
    const defender = regions.find((r) => r.id === elephant.TargetRegion);

    if (!attacker || !defender) {
      console.error("EventDialog: Attacked of defender not found!");
      return;
    }

    const defenderDominatedRegions = regions.filter(
      (r) => r.dominator === defender.id
    );

    const newRegions = regions.filter(
      (r) =>
        r.id != attacker.id &&
        r.id != defender.id &&
        !defenderDominatedRegions.includes(r)
    );

    const attackStrength =
      calculateEmpireStrength(attacker.id, regions) +
      (activeEvent?.strength ?? 0);
    const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
    const actionSuccessful = attackStrength > defenseStrength;

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

    if (actionSuccessful) {
      executeElephantsMarch(true);
    } else {
      executeElephantsMarch(false);
    }
  };

  const confirmEvent = () => {
    setShowEventDialog(false);
  };

  const renderEventDialog = () => {
    if (!activeEvent) {
      return;
    }

    switch (activeEvent.type) {
      case EventType.Shuffle:
        return <ShuffleEvent onOk={confirmEvent} />;
      case EventType.Windfall:
        return <WindfallEvent onOk={confirmEvent} />;
      case EventType.Turmoil:
        return <TurmoilEvent onOk={confirmEvent} />;
      case EventType.Leader:
        return (
          <LeaderEvent
            drawStackRegion={drawStackRegion}
            event={activeEvent}
            regions={regions}
            onOk={executeLeaderEvent}
          />
        );
      case EventType.Peace:
        return <PeaceEvent onOk={confirmEvent} />;
      case EventType.ResolveCrisis:
        return (
          <CrisisEvent
            regions={regions}
            elephant={elephant}
            event={activeEvent}
            onOk={executeCrisisEvent}
          />
        );
      case EventType.ForeignInvasion:
        return (
          <ForeignInvasionEvent
            onOk={confirmEvent}
            elephant={elephant}
            regions={regions}
            drawStackRegion={drawStackRegion}
            setRegions={setRegions}
            setElephant={setElephant}
          />
        );

      default:
        return;
    }
  };

  const addUnrestToAllCompanyControlledRegions = () => {
    console.log("Adding 1 unrest to every Company controlled region");
    const newRegions = [...regions];

    for (const region of newRegions) {
      if (region.status === RegionStatus.CompanyControlled) {
        console.log(region.unrest);
        region.unrest++;
      }
    }
    setRegions(newRegions);
  };

  const handleResetCounters = () => {
    globalEffectsContext.setGlobalEffects({
      ...globalEffectsContext.globalEffects,
      RegionsLost: 0,
    });
  };

  const punjab = regions.find((r) => r.id === RegionName.Punjab) ?? regions[0];
  const delhi = regions.find((r) => r.id === RegionName.Delhi) ?? regions[0];
  const bengal = regions.find((r) => r.id === RegionName.Bengal) ?? regions[0];
  const bombay = regions.find((r) => r.id === RegionName.Bombay) ?? regions[0];
  const madras = regions.find((r) => r.id === RegionName.Madras) ?? regions[0];
  const mysore = regions.find((r) => r.id === RegionName.Mysore) ?? regions[0];
  const maratha =
    regions.find((r) => r.id === RegionName.Maratha) ?? regions[0];
  const hyderabad =
    regions.find((r) => r.id === RegionName.Hyderabad) ?? regions[0];

  return (
    <Container fixed sx={{ bgcolor: "beige", m: 2 }}>
      <Grid container spacing={2}>
        <Grid xs={4}>
          <RegionCard
            region={punjab}
            handleDeployButtonClick={handleDeployButtonClick}
            handleModifyRegionClick={handleModifyRegionClick}
          />
        </Grid>
        <Grid xs={4}>
          <RegionCard
            region={delhi}
            handleDeployButtonClick={handleDeployButtonClick}
            handleModifyRegionClick={handleModifyRegionClick}
          />
        </Grid>
        <Grid xs={4}>
          <RegionCard
            region={bengal}
            handleDeployButtonClick={handleDeployButtonClick}
            handleModifyRegionClick={handleModifyRegionClick}
          />
        </Grid>

        <Grid xs={4}>
          <RegionCard
            region={bombay}
            handleDeployButtonClick={handleDeployButtonClick}
            handleModifyRegionClick={handleModifyRegionClick}
          />
        </Grid>
        <Grid xs={4}>
          <RegionCard
            region={hyderabad}
            handleDeployButtonClick={handleDeployButtonClick}
            handleModifyRegionClick={handleModifyRegionClick}
          />
        </Grid>
        <Grid xs={4}>
          <RegionCard
            region={maratha}
            handleDeployButtonClick={handleDeployButtonClick}
            handleModifyRegionClick={handleModifyRegionClick}
          />
        </Grid>

        <Grid xs={4}>
          <RegionCard
            region={mysore}
            handleDeployButtonClick={handleDeployButtonClick}
            handleModifyRegionClick={handleModifyRegionClick}
          />
        </Grid>
        <Grid xs={4}>
          <RegionCard
            region={madras}
            handleDeployButtonClick={handleDeployButtonClick}
            handleModifyRegionClick={handleModifyRegionClick}
          />
        </Grid>
      </Grid>
      <>
        <EventStack />

        <ElephantCard
          elephant={elephant}
          setElephant={setElephant}
          regions={regions}
        />

        <Card>
          <CardContent>
            <Box
              display={"flex"}
              justifyContent={"space-evenly"}
              alignItems={"center"}
            >
              <Typography>
                Regions Lost : {globalEffectsContext.globalEffects.RegionsLost}
              </Typography>
              <Button onClick={() => setShowGlobalEffectsDialog(true)}>
                Adjust Laws & Global Effects
              </Button>

              <Button onClick={addUnrestToAllCompanyControlledRegions}>
                Add 1 unrest to every Company controlled regions
              </Button>
            </Box>
          </CardContent>
        </Card>
      </>

      {showDeployDialog && (
        <DeployDialog
          onConfirmResults={handleDeployConfirm}
          onCancel={handleDeployDialogCancel}
          regions={regions}
          targetRegion={activeRegion}
          elephant={elephant}
        />
      )}
      {showModifyRegionDialog && (
        <ModifyRegionDialog
          region={activeRegion}
          onSave={handleModifyRegionSave}
          onCancel={handleModifyRegionCancel}
        />
      )}
      {activeEvent && renderEventDialog()}
      {showGlobalEffectsDialog && (
        <GlobalEffectsDialog
          onClose={() => setShowGlobalEffectsDialog(false)}
        />
      )}
    </Container>
  );
};
