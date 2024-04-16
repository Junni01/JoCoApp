import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Typography,
} from "@mui/material";
import {
  Elephant,
  EventCard,
  EventType,
  Presidency,
  Region,
  RegionStatus,
  Scenario,
} from "./Types";
import { EventDeck, getElephantInitialPosition, getRegionData } from "./Data";
import { useEffect, useMemo, useState } from "react";
import { DeployDialog, DeployType } from "./DeployDialog";
import { ModifyRegionDialog } from "./ModifyRegionDialog";
import { EventDialog } from "./EventDialog";

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
  const [activeRegion, setActiveRegion] = useState<Region | undefined>(
    undefined
  );
  const [activeEvent, setActiveEvent] = useState<EventCard | undefined>();

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
    if (activeEvent?.type === EventType.Shuffle) {
      executeShuffleEvent();
    } else {
      discardEvent();
    }
    setActiveEvent(undefined);
    setShowEventDialog(false);
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
    const newRegionArray = regions.filter((r) => r.id !== activeRegion.id);
    activeRegion.unrest = 0;
    activeRegion.lootAvailable = false;
    activeRegion.status = RegionStatus.CompanyControlled;
    activeRegion.towerLevel = 0;
    activeRegion.dominator = undefined;
    activeRegion.controllingPresidency = deployingPresidency;
    setRegions([...newRegionArray, activeRegion]);
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
    let dominatedRegions = regions.filter(
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

    for (let region of dominatedRegions) {
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
      {showEventDialog && activeEvent && (
        <EventDialog
          onOk={handleEventDialogOk}
          event={activeEvent}
          drawStackRegion={drawStackRegion}
          elephant={elephant}
          regions={regions}
        />
      )}
    </Container>
  );
}

export default App;
