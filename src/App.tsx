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
import { EventDialog } from "./EventDialog";
import { doesEmpireShatter, getCrisisType, marchElephant } from "./Helpers";
import { ShuffleEvent } from "./assets/EventDialogs/ShuffleEvent";
import { WindfallEvent } from "./assets/EventDialogs/WindfallEvent";
import { TurmoilEvent } from "./assets/EventDialogs/TurmoilEvent";
import { LeaderEvent } from "./assets/EventDialogs/LeaderEvent";
import { PeaceEvent } from "./assets/EventDialogs/PeaceEvent";
import { CrisisEvent } from "./assets/EventDialogs/CrisisEvent";

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
    const newElephantRegion = marchElephant(
      drawStackRegion,
      regions,
      activeEvent.symbol
    );

    if (!newElephantRegion) {
      console.error("newElephantRegion is undefined");
      return;
    }

    if (elephant.TargetRegion !== undefined) {
      const mainRegion = regions.find((r) => r.id === elephant.MainRegion);
      const targetRegion = regions.find((r) => r.id === elephant.TargetRegion);

      if (!mainRegion || !targetRegion) {
        console.error("Main or Target region is undefined");
        return;
      }

      const newRegionArray = regions.filter(
        (r) => r.id !== targetRegion?.id && r.id !== mainRegion?.id
      );

      console.log("newRegionArray", newRegionArray);

      mainRegion.towerLevel++;

      if (targetRegion?.status !== RegionStatus.CompanyControlled) {
        targetRegion.towerLevel++;
      }

      setRegions([...newRegionArray, mainRegion, targetRegion]);
    } else {
      const mainRegion = regions.find((r) => r.id === elephant.MainRegion);
      if (!mainRegion) {
        console.error("Main region is undefined");
        return;
      }
      mainRegion.unrest = 0;
      const newRegionArray = regions.filter((r) => r.id !== mainRegion.id);
      setRegions([...newRegionArray, mainRegion]);
    }

    if (newElephantRegion.TargetRegion !== undefined) {
      setElephant({
        MainRegion: newElephantRegion.MainRegion,
        TargetRegion: newElephantRegion.TargetRegion,
      });
    } else {
      setElephant({
        MainRegion: newElephantRegion.MainRegion,
        TargetRegion: undefined,
      });
    }

    discardEvent();
    setActiveEvent(undefined);
    setShowEventDialog(false);
  };

  const executeLeaderEvent = (
    mainCrisisWon: boolean,
    rebellions: Rebellion[]
  ) => {
    console.log("executeLeaderEvent");
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
        dominator.towerLevel--;
        setRegions([...newRegionArray, drawStackRegion, dominator]);
      }
    }

    if (drawStackRegion.status === RegionStatus.CompanyControlled) {
      const rebellionRegions: Region[] = [];

      rebellions.push({
        Region: drawStackRegion,
        RebellionSuccessful: mainCrisisWon,
      });

      for (const rebellion of rebellions) {
        const region = regions.find((r) => r.id === rebellion.Region.id);

        if (!region) {
          console.error("Region not found in regions array");
          return;
        }
        if (rebellion.RebellionSuccessful) {
          region.status = RegionStatus.Sovereign;
          region.controllingPresidency = undefined;
          region.towerLevel = 1;
        } else {
          region.towerLevel--;
        }
        rebellionRegions.push(region);
      }

      const newRegionArray = regions.filter(
        (r) => !rebellionRegions.includes(r)
      );

      setRegions([...newRegionArray, ...rebellionRegions]);
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
        return <SovereignInvadesSovereign {...props} />;
      case CrisisType.SovereignInvadesDominated:
        return <SovereignInvadesDominated {...props} />;

      case CrisisType.SovereignInvadesEmpireCapital:
        return <SovereignInvadesEmpireCapital {...props} />;
      case CrisisType.EmpireInvadesSovereign:
        return <EmpireInvadesSovereign {...props} />;

      case CrisisType.DominatedRebelsAgainstEmpire:
        return <DominatedRebelsAgainstEmpire {...props} />;

      case CrisisType.SovereignInvadesCompany:
        return <SovereignInvadesCompany {...props} />;

      case CrisisType.EmpireInvadesCompany:
        return <EmpireInvadesCompany {...props} />;

      case CrisisType.CompanyControlledRebels:
        return <CompanyControlledRebels {...props} />;
      default:
        console.error(
          "Crisis Type Switch Case Default: This should not happen"
        );
    }
    discardEvent();
    setActiveEvent(undefined);
    setShowEventDialog(false);
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
