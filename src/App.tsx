import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import {
  CrisisType,
  DeployType,
  Elephant,
  EventCard,
  EventType,
  Presidency,
  Rebellion,
  Region,
  RegionStatus,
  Scenario,
} from "./Types";
import { EventDeck, getElephantInitialPosition, getRegionData } from "./Data";
import { useMemo, useState } from "react";
import { DeployDialog } from "./DeployDialog";
import { ModifyRegionDialog } from "./ModifyRegionDialog";
import {
  calculateEmpireStrength,
  doesEmpireShatter,
  getCrisisType,
  marchElephant,
} from "./Helpers";
import { ShuffleEvent } from "./assets/EventDialogs/ShuffleEvent";
import { WindfallEvent } from "./assets/EventDialogs/WindfallEvent";
import { TurmoilEvent } from "./assets/EventDialogs/TurmoilEvent";
import { LeaderEvent } from "./assets/EventDialogs/LeaderEvent";
import { PeaceEvent } from "./assets/EventDialogs/PeaceEvent";
import { CrisisEvent } from "./assets/EventDialogs/CrisisEvent";
import { act } from "react-dom/test-utils";

function App() {
  const scenario = Scenario.SeventeenTen;

  const [regions, setRegions] = useState<Region[]>(getRegionData(scenario));
  const [elephant, setElephant] = useState<Elephant>(
    getElephantInitialPosition(scenario)
  );
  const [eventDeck, setEvenDeck] = useState<EventCard[]>(EventDeck);
  const [eventDiscardPile, setEventDiscardPile] = useState<EventCard[]>([]);
  const [showEventDialog, setShowEventDialog] = useState<boolean>(false);
  const [showDeployDialog, setShowDeployDialog] = useState<boolean>(false);
  const [showModifyRegionDialog, setShowModifyRegionDialog] =
    useState<boolean>(false);
  const [activeRegion, setActiveRegion] = useState<Region>();
  const [activeEvent, setActiveEvent] = useState<EventCard | undefined>();
  const [regionsLostCount, setRegionsLostCount] = useState<number>(0);

  const shuffleEventPile = (pile: EventCard[]) => {
    for (let i = pile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pile[i], pile[j]] = [pile[j], pile[i]];
    }
    return pile;
  };

  console.log(eventDeck);

  const mapRegions = useMemo(
    () => regions.sort((a, b) => a.index - b.index),
    [regions]
  );

  const drawStackRegion =
    regions.find((r) => r.id === eventDeck[eventDeck.length - 1].Region) ??
    regions[0];

  const drawEvent = () => {
    if (eventDeck.length === 0) {
      console.error("Event Draw pile is empty! This should not happen");
      return;
    }
    const event = eventDeck.pop();
    setEvenDeck([...eventDeck]);
    setActiveEvent(event);
    setShowEventDialog(true);
  };

  const handleEventDialogOk = () => {
    discardEvent();
    setActiveEvent(undefined);
    setShowEventDialog(false);
  };

  const discardEvent = () => {
    if (!activeEvent) {
      console.error("active event is undefined");
      return;
    }
    const discards = [...eventDiscardPile];
    discards.push(activeEvent);
    setEventDiscardPile([...discards]);
  };

  const handleDeployButtonClick = (region: Region) => {
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

    if (doesEmpireShatter(activeRegion, regions)) {
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
    }
    deployRedirectElephant();
    setActiveRegion(undefined);
    setShowDeployDialog(false);
  };

  const handleModifyRegionClick = (region: Region) => {
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

  const executeShuffleEvent = () => {
    const events = [...eventDeck];
    const shuffleEvent = activeEvent;
    if (!shuffleEvent) {
      console.error("active event is undefined");
      return;
    }
    // Put shuffle event into the draw pile.
    events.push(shuffleEvent);
    // Shuffle the draw pile
    shuffleEventPile(events);

    const discards = [...eventDiscardPile];
    // Shuffle discards pile
    shuffleEventPile(discards);
    // Put discards on "top" of draw pile
    events.push(...discards);
    setEvenDeck([...events]);
    setEventDiscardPile([]);

    setActiveEvent(undefined);
    setShowEventDialog(false);
  };

  const executePeaceEvent = () => {
    if (!activeEvent) {
      console.error("active event is undefined");
      return;
    }

    const mainRegion = regions.find((r) => r.id === elephant.MainRegion);
    const targetRegion = regions.find((r) => r.id === elephant.TargetRegion);

    if (elephant.TargetRegion !== undefined) {
      if (!mainRegion || !targetRegion) {
        console.error("Main or Target region is undefined");
        return;
      }

      const newRegionArray = regions.filter(
        (r) => r.id !== targetRegion?.id && r.id !== mainRegion?.id
      );

      mainRegion.towerLevel++;

      if (targetRegion?.status !== RegionStatus.CompanyControlled) {
        targetRegion.towerLevel++;
      }

      setRegions([...newRegionArray, mainRegion, targetRegion]);
    } else {
      if (!mainRegion) {
        console.error("Main region is undefined");
        return;
      }
      mainRegion.unrest = 0;
      const newRegionArray = regions.filter((r) => r.id !== mainRegion.id);
      setRegions([...newRegionArray, mainRegion]);
    }

    executeElephantsMarch(false);

    discardEvent();
    setActiveEvent(undefined);
    setShowEventDialog(false);
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
      const dominator = regions.find((r) => r.id === drawStackRegion.dominator);

      if (!dominator) {
        console.error("Dominator for dominated region not found!");
        return;
      }

      const rebellionStrength =
        drawStackRegion.towerLevel + (activeEvent?.strength ?? 0);
      const dominatorStrength = dominator.towerLevel;
      const rebellionSuccessful = rebellionStrength > dominatorStrength;

      const newRegionArray = regions.filter(
        (r) => r.id !== drawStackRegion.id && r.id !== dominator.id
      );

      if (rebellionSuccessful) {
        drawStackRegion.status = RegionStatus.Sovereign;
        drawStackRegion.dominator = undefined;
        if (doesEmpireShatter(drawStackRegion, regions)) {
          dominator.status = RegionStatus.Sovereign;
        }
        setRegions([...newRegionArray, drawStackRegion, dominator]);
      } else {
        if (dominator.towerLevel > 0) {
          dominator.towerLevel = dominator.towerLevel - 1;
        }
        setRegions([...newRegionArray, drawStackRegion, dominator]);
      }
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
      (r) => r.id != attacker.id && r.id != defender.id && defenderDominator.id
    );

    const attackStrength = attacker.towerLevel + (activeEvent?.strength ?? 0);
    const defenseStrength = calculateEmpireStrength(defender.id, regions) ?? 0;
    const actionSuccessful = attackStrength > defenseStrength;

    if (actionSuccessful) {
      if (doesEmpireShatter(defender, regions)) {
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
      if (doesEmpireShatter(attacker, regions)) {
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
      defender.status = RegionStatus.Sovereign;
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
        r.id === attacker.id &&
        r.id === defender.id
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
      executeElephantsMarch(false);
    } else {
      defender.status = RegionStatus.Dominated;
      defender.dominator = attacker.id;
      defender.controllingPresidency = undefined;
      defender.towerLevel = 1;
      defender.unrest = 0;
      executeElephantsMarch(true);
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
        r.id === attacker.id &&
        r.id === defender.id
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

  const renderEventDialog = () => {
    if (!activeEvent) {
      return;
    }

    switch (activeEvent.type) {
      case EventType.Shuffle:
        return <ShuffleEvent onOk={executeShuffleEvent} />;
      case EventType.Windfall:
        return (
          <WindfallEvent
            drawStackRegion={drawStackRegion}
            onOk={handleEventDialogOk}
          />
        );
      case EventType.Turmoil:
        return (
          <TurmoilEvent
            drawStackRegion={drawStackRegion}
            onOk={handleEventDialogOk}
          />
        );
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
        return (
          <PeaceEvent
            drawStackRegion={drawStackRegion}
            regions={regions}
            event={activeEvent}
            elephant={elephant}
            onOk={executePeaceEvent}
          />
        );
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
        return <Typography>Foreign Invasion</Typography>;

      default:
        return;
    }
  };

  const executeElephantsMarch = (imperialAmbitions: boolean) => {
    if (!activeEvent) {
      console.error("Active event is null");
      return;
    }

    const elephantMainRegion = regions.find(
      (r) => r.id === elephant.MainRegion
    );

    if (!elephantMainRegion) {
      console.error("Elephant main region missing");
      return;
    }

    let newElephant: Elephant | undefined;

    if (imperialAmbitions) {
      console.log("Elephant: Imperial Ambitions");
      newElephant = marchElephant(
        elephantMainRegion,
        regions,
        activeEvent.symbol
      );
    } else {
      console.log("Elephant: No Imperial Ambitions");
      newElephant = marchElephant(drawStackRegion, regions, activeEvent.symbol);
    }

    if (!newElephant) {
      console.error("Elephant march failed");
      return;
    }
    setElephant(newElephant);
  };

  return (
    <Container>
      <Box display={"flex"} flexWrap={"wrap"}>
        {mapRegions.map((r) => {
          return (
            <Card key={r.id} sx={{ m: 2 }}>
              <CardContent>
                <Typography variant="h6">{r.id}</Typography>
                <Typography>
                  Status:
                  {r.status === RegionStatus.Sovereign && "Sovereign"}
                  {r.status === RegionStatus.Dominated &&
                    `Dominated By ${r.dominator}`}
                  {r.status === RegionStatus.EmpireCapital && "Empire Capital"}
                  {r.status === RegionStatus.CompanyControlled &&
                    `Company controlled by ${r.controllingPresidency}`}
                </Typography>
                {r.status !== RegionStatus.CompanyControlled && (
                  <Typography>Tower Level: {r.towerLevel}</Typography>
                )}
                {r.lootAvailable && (
                  <Typography>Loot: {r.lootAmount}</Typography>
                )}
                {r.unrest > 0 && <Typography>Unrest: {r.unrest}</Typography>}
              </CardContent>
              <CardActions>
                <Button onClick={() => handleDeployButtonClick(r)}>
                  Deploy
                </Button>
                <Button
                  onClick={() => {
                    handleModifyRegionClick(r);
                  }}
                >
                  Modify Region
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Box>
      <Box>
        <Card>
          Elephant
          <CardContent>
            {!elephant.TargetRegion ? (
              <Typography>{elephant.MainRegion}</Typography>
            ) : (
              <Typography>
                {elephant.MainRegion} {" -> "} {elephant.TargetRegion}
              </Typography>
            )}
            <Typography>Top of Event Pile: {drawStackRegion?.id}</Typography>
            <Typography>
              Regions Lost: {regionsLostCount}
              <Button onClick={() => setRegionsLostCount(0)}>Reset</Button>{" "}
            </Typography>

            <Button onClick={drawEvent}>Draw Event</Button>
          </CardContent>
        </Card>
      </Box>
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
      {showEventDialog && activeEvent && renderEventDialog()}
    </Container>
  );
}

export default App;
