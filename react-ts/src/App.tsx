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
  Region,
  RegionStatus,
  Scenario,
} from "./Types";
import { EventDeck, getElephantInitialPosition, getRegionData } from "./Data";
import { useState } from "react";
import { ShuffleDialog } from "./ShuffleDialog";
import { DeployDialog } from "./DeployDialog";

function App() {
  const scenario = Scenario.SeventeenTen;

  const [regions, setRegions] = useState<Region[]>(getRegionData(scenario));
  const [elephant, setElephant] = useState<Elephant>(
    getElephantInitialPosition(scenario)
  );
  const [eventDeck, setEvenDeck] = useState<EventCard[]>(EventDeck);
  const [eventDiscardPile, setEventDiscardPile] = useState<EventCard[]>([]);
  const [showShuffleDialog, setShowSuffleDialog] = useState<boolean>(false);
  const [showDeployDialog, setShowDeployDialog] = useState<boolean>(false);
  const [activeRegion, setActiveRegion] = useState<Region | undefined>(
    undefined
  );

  const shuffleEventPile = (pile: EventCard[]) => {
    for (let i = pile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pile[i], pile[j]] = [pile[j], pile[i]];
    }
    return pile;
  };

  shuffleEventPile(eventDeck);

  const deployToRegion = (region: Region) => {
    if (region.status === RegionStatus.CompanyControlled) {
      const regionPower = region.unrest;
    } else if (region.status === RegionStatus.Sovereign) {
      const regionPower = region.towerLevel;
    } else if (region.status === RegionStatus.EmpireCapital) {
      let power = region.towerLevel;
      const dominatedRegions = regions.filter((d) => {
        d.dominator === region.id;
      });
      if (dominatedRegions.length === 0)
        console.log("Empire capital has no dominated regions!");
      dominatedRegions.forEach((r) => {
        power += r.towerLevel;
      });
    } else {
      let power = region.towerLevel;
      const empireCapital = regions.find((a) => a.id === region.dominator);
      if (!empireCapital)
        console.log("Empire Capital for Dominated Region Not Found!");
      power += empireCapital?.towerLevel ?? 0;
      const empireOtherRegions = regions.filter((r) => {
        r.dominator === empireCapital?.id && r.id !== region.id;
      });
      empireOtherRegions.forEach((r) => (power += r.towerLevel));
    }
  };

  const drawEvent = () => {
    const event = eventDeck.pop();
    if (!event) {
      console.log("Event Draw pile is empty! This should not happen");
      return;
    }

    switch (event.type) {
      case EventType.Shuffle:
        setShowSuffleDialog(true);
        break;
    }
  };

  const executeShuffleEvent = () => {
    const events = [...eventDeck];
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
    const events = [...eventDeck];
    const event = events.pop();
    setEvenDeck([...events]);
    const discards = [...eventDiscardPile];
    if (event) {
      discards.push(event);
    }
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
    targetRegionId: string
  ) => {
    const affectedRegion = regions.find((r) => r.id === targetRegionId);

    if (!affectedRegion) {
      console.error(
        "handleSuccessfulDeployToCompanyControlledRegion: target Region not found!"
      );
      return;
    }
    const newRegionArray = regions.filter((r) => r.id !== affectedRegion.id);
    affectedRegion.unrest = 0;
    setRegions([...newRegionArray, affectedRegion]);
  };

  const handleSuccessfulDeployToSovereignRegion = (targetRegionId: string) => {
    const affectedRegion = regions.find((r) => r.id === targetRegionId);

    if (!affectedRegion) {
      console.error(
        "handleSuccessfulDeployToCompanyControlledRegion: target Region not found!"
      );
      return;
    }
    const newRegionArray = regions.filter((r) => r.id !== affectedRegion.id);
    affectedRegion.unrest = 0;
    affectedRegion.lootAvailable = false;
    affectedRegion.status = RegionStatus.CompanyControlled;
    affectedRegion.towerLevel = 0;
    setRegions([...newRegionArray, affectedRegion]);
  };

  const handleSuccessfulDeployToDominatedRegion = (targetRegionId: string) => {
    const affectedRegion = regions.find((r) => r.id === targetRegionId);

    if (!affectedRegion) {
      console.error(
        "handleSuccessfulDeployToCompanyControlledRegion: target Region not found!"
      );
      return;
    }
    const newRegionArray = regions.filter((r) => r.id !== affectedRegion.id);
    affectedRegion.unrest = 0;
    affectedRegion.lootAvailable = false;
    affectedRegion.status = RegionStatus.CompanyControlled;
    affectedRegion.towerLevel = 0;
    affectedRegion.dominator = undefined;
    setRegions([...newRegionArray, affectedRegion]);
  };

  const handleSuccessfulDeployToCapitalRegion = (targetRegionId: string) => {
    const affectedRegion = regions.find((r) => r.id === targetRegionId);

    if (!affectedRegion) {
      console.error(
        "handleSuccessfulDeployToCompanyControlledRegion: target Region not found!"
      );
      return;
    }
    let dominatedRegions = regions.filter(
      (r) => r.dominator === affectedRegion.id
    );
    affectedRegion.unrest = 0;
    affectedRegion.lootAvailable = false;
    affectedRegion.status = RegionStatus.CompanyControlled;
    affectedRegion.towerLevel = 0;
    affectedRegion.dominator = undefined;
    const newRegionArray = regions.filter(
      (r) => r.id !== affectedRegion.id || dominatedRegions.includes(r)
    );

    const modifiedDominatedRegions: Region[] = [];

    for (let region of dominatedRegions) {
      region.dominator = undefined;
      region.status = RegionStatus.Sovereign;
      modifiedDominatedRegions.push(region);
    }

    setRegions([
      ...newRegionArray,
      ...modifiedDominatedRegions,
      affectedRegion,
    ]);
  };

  return (
    <Container>
      <Box display={"flex"} flexWrap={"wrap"}>
        {regions?.map((r) => {
          return (
            <Card sx={{ m: 2 }}>
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
                <Typography>Tower Level: {r.towerLevel}</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => handleDeployButtonClick(r)}>
                  Deploy
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
            <Typography>
              Top of Event Pile: {eventDeck[eventDeck.length - 1].Region}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      {showShuffleDialog && <ShuffleDialog onOk={executeShuffleEvent} />}
      {showDeployDialog && (
        <DeployDialog
          onOk={handleDeployDialogCancel}
          regions={regions}
          targetRegion={activeRegion}
        />
      )}
    </Container>
  );
}

export default App;
