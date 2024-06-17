import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
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
import { EventsInIndiaDialog } from "./EventsInIndiaDialog";

export const IndiaMap = () => {
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const regions = globalEffectsContext.regions;
  const elephant = globalEffectsContext.elephant;
  const eventDeck = globalEffectsContext.eventDeck;
  const setRegions = globalEffectsContext.setRegions;
  const activeEvent = globalEffectsContext.activeEvent;
  const executeElephantsMarch = globalEffectsContext.executeElephantsMarch;
  const discardEvent = globalEffectsContext.discardEvent;

  const [showGlobalEffectsDialog, setShowGlobalEffectsDialog] =
    useState<boolean>(false);

  const [deployRegion, setDeployRegion] = useState<Region | undefined>();
  const [showIndiaEventsDialog, setShowIndiaEventsDialog] =
    useState<boolean>(false);

  console.log(eventDeck);

  const handleDeployDialogOk = () => {
    setDeployRegion(undefined);
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
  };

  const renderEventDialog = () => {
    if (!activeEvent) {
      return;
    }

    switch (activeEvent.type) {
      case EventType.Shuffle:
        return <ShuffleEvent />;
      case EventType.Windfall:
        return <WindfallEvent />;
      case EventType.Turmoil:
        return <TurmoilEvent />;
      case EventType.Leader:
        return <LeaderEvent />;
      case EventType.Peace:
        return <PeaceEvent />;
      case EventType.ResolveCrisis:
        return <CrisisEvent />;
      case EventType.ForeignInvasion:
        return <ForeignInvasionEvent />;

      default:
        return;
    }
  };

  const addUnrestToAllCompanyControlledRegions = () => {
    console.log("Adding 1 unrest to every Company controlled region");
    const newRegions = [...regions];

    for (const region of newRegions) {
      if (region.status === RegionStatus.CompanyControlled) {
        region.unrest++;
      }
    }
    setRegions(newRegions);
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
    <Container sx={{ bgcolor: "beige" }}>
      <Grid container>
        <Grid item xs={4}>
          <RegionCard
            region={punjab}
            handleDeployButtonClick={() => setDeployRegion(punjab)}
          />
        </Grid>
        <Grid item xs={4}>
          <RegionCard
            region={delhi}
            handleDeployButtonClick={() => setDeployRegion(delhi)}
          />
        </Grid>
        <Grid item xs={4}>
          <RegionCard
            region={bengal}
            handleDeployButtonClick={() => setDeployRegion(bengal)}
          />
        </Grid>

        <Grid item xs={4}>
          <RegionCard
            region={bombay}
            handleDeployButtonClick={() => setDeployRegion(bombay)}
          />
        </Grid>
        <Grid item xs={8}>
          <RegionCard
            region={hyderabad}
            handleDeployButtonClick={() => setDeployRegion(hyderabad)}
          />
        </Grid>
        <Grid item xs={12}>
          <RegionCard
            region={maratha}
            handleDeployButtonClick={() => setDeployRegion(maratha)}
          />
        </Grid>
        <Grid item xs={6}>
          <RegionCard
            region={mysore}
            handleDeployButtonClick={() => setDeployRegion(mysore)}
          />
        </Grid>
        <Grid item xs={6}>
          <RegionCard
            region={madras}
            handleDeployButtonClick={() => setDeployRegion(madras)}
          />
        </Grid>
      </Grid>
      <>
        <EventStack />

        <ElephantCard />

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
              <Button onClick={() => setShowIndiaEventsDialog(true)}>
                Handle Events In India
              </Button>
            </Box>
          </CardContent>
        </Card>
      </>

      {deployRegion && (
        <DeployDialog
          onConfirm={handleDeployDialogOk}
          targetRegion={deployRegion}
        />
      )}
      {activeEvent && renderEventDialog()}
      {showGlobalEffectsDialog && (
        <GlobalEffectsDialog
          onClose={() => setShowGlobalEffectsDialog(false)}
        />
      )}
      {showIndiaEventsDialog && (
        <EventsInIndiaDialog onOk={() => setShowIndiaEventsDialog(false)} />
      )}
    </Container>
  );
};
