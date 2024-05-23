import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region, EventCard, RegionStatus, Rebellion } from "../Types";
import { doesLossOfRegionCauseEmpireShatter } from "../Helpers";
import { useContext, useState } from "react";
import { RebellionInCompanyControlled } from "./Rebellions";
import { GlobalEffectsContext } from "../GlobalEffectsContext";
import { EventDialog } from "../DialogStyles";

export const LeaderEvent = () => {
  const globalEffects = useContext(GlobalEffectsContext);
  const {
    regions,
    setRegions,
    drawStackRegion,
    activeEvent,
    discardEvent,
    executeElephantsMarch,
  } = globalEffects;

  const additionalCrises = regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  const handleEventDone = () => {
    discardEvent();
  };

  const executeLeaderInSovereignOrCapital = () => {
    const newRegionArray = regions.filter((r) => r.id !== drawStackRegion.id);
    drawStackRegion.towerLevel++;
    setRegions([...newRegionArray, drawStackRegion]);
    handleEventDone();
  };

  const executeLeaderInDominated = (
    rebellingRegion: Region,
    dominator: Region,
    rebellionSuccessful: boolean,
    empireShatters: boolean
  ) => {
    const newRegionArray = regions.filter(
      (r) => r.id !== rebellingRegion.id && r.id !== dominator.id
    );

    if (rebellionSuccessful) {
      if (empireShatters) {
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
    handleEventDone();
  };

  const executeLeaderInCompanyControlled = (rebellionOutcomes: Rebellion[]) => {
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
    executeElephantsMarch(false);
    handleEventDone();
  };

  const renderDialogContent = () => {
    if (
      drawStackRegion.status === RegionStatus.Sovereign ||
      drawStackRegion.status === RegionStatus.EmpireCapital
    ) {
      return (
        <LeaderInSovereignAndCapital
          mainRegionName={drawStackRegion.id}
          onOk={executeLeaderInSovereignOrCapital}
        />
      );
    } else if (drawStackRegion.status === RegionStatus.Dominated) {
      return (
        <LeaderInDominated
          drawStackRegion={drawStackRegion}
          regions={regions}
          event={activeEvent}
          onOk={executeLeaderInDominated}
        />
      );
    } else if (drawStackRegion.status === RegionStatus.CompanyControlled) {
      return (
        <LeaderInCompanyControlled
          drawStackRegion={drawStackRegion}
          event={activeEvent}
          additionalCrises={additionalCrises}
          handleConfirmResults={executeLeaderInCompanyControlled}
        />
      );
    } else {
      return null;
    }
  };

  return <EventDialog>{renderDialogContent()}</EventDialog>;
};

const LeaderInSovereignAndCapital = (props: {
  mainRegionName: string;
  onOk: () => void;
}) => {
  return (
    <>
      <DialogTitle>Event: Leader in {props.mainRegionName}.</DialogTitle>
      <DialogContent>
        <Typography>The region's strength grows</Typography>
        <Typography>Add 1 tower level to {props.mainRegionName}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onOk()}>Ok</Button>
      </DialogActions>
    </>
  );
};

const LeaderInDominated = (props: {
  drawStackRegion: Region;
  regions: Region[];
  event: EventCard | undefined;
  onOk: (
    rebellingRegion: Region,
    dominator: Region,
    rebellionSuccessful: boolean,
    empireShatters: boolean
  ) => void;
}) => {
  const dominator = props.regions.find(
    (r) => r.id === props.drawStackRegion.dominator
  );

  if (!dominator) {
    console.error(
      "EventDialog:EventTypeLeader: Dominator for dominated region not found!"
    );
    return;
  }

  if (!props.event) {
    console.error("EventDialog:EventTypeLeader: Event is undefined!");
    return;
  }

  const rebellionStrength =
    props.drawStackRegion.towerLevel + props.event.strength;
  const dominatorStrength = dominator.towerLevel;
  const rebellionSuccessful = rebellionStrength > dominatorStrength;

  const empireShatters = doesLossOfRegionCauseEmpireShatter(
    props.drawStackRegion,
    props.regions
  );

  return (
    <>
      <DialogTitle>Event: Leader in {props.drawStackRegion.id}.</DialogTitle>
      <DialogContent>
        <Typography>
          Rebellion in dominated {props.drawStackRegion.id} (strength:{" "}
          {rebellionStrength}) against the capital{" "}
          {props.drawStackRegion.dominator} (strength: {dominatorStrength}).
        </Typography>
        {rebellionSuccessful ? (
          <>
            <Typography>
              Rebellion in {props.drawStackRegion.id} is Successful, remove
              empire flag and close every open order in{" "}
              {props.drawStackRegion.id}. If all orders are already closed,
              perform a Cascade. The Region is now Sovereign.{" "}
            </Typography>
            {empireShatters && (
              <Typography>
                {props.drawStackRegion.dominator} Empire shatters: Remove large
                flag from {props.drawStackRegion.dominator}
              </Typography>
            )}
          </>
        ) : (
          <Typography>
            Rebellion in {props.drawStackRegion.id} failed. Remove one tower
            level from {dominator.id}.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() =>
            props.onOk(
              props.drawStackRegion,
              dominator,
              rebellionSuccessful,
              empireShatters
            )
          }
        >
          Ok
        </Button>
      </DialogActions>
    </>
  );
};

const LeaderInCompanyControlled = (props: {
  drawStackRegion: Region;
  event: EventCard | undefined;
  additionalCrises: Region[];
  handleConfirmResults: (rebellionResults: Rebellion[]) => void;
}) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);

  const [activeRebellionRegion, setActiveRebellionRegion] = useState<Region>(
    props.drawStackRegion
  );
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

    if (rebellionIndex + 1 > props.additionalCrises.length) {
      props.handleConfirmResults(rebellionOutcomes);
    } else {
      setActiveRebellionRegion(props.additionalCrises[rebellionIndex]);
      setRebellionIndex(rebellionIndex + 1);
    }
  };

  const getRebellionStrength = () => {
    const unrestStrength = globalEffectsContext.globalEffects.SepoyRecruitment
      ? activeRebellionRegion.unrest * 2
      : activeRebellionRegion.unrest;
    return rebellionIndex === 0
      ? unrestStrength + (props.event?.strength ?? 0)
      : unrestStrength;
  };

  return (
    <>
      <DialogTitle>
        {" "}
        Event: Leader in {props.drawStackRegion.id}. (Strength:{" "}
        {props.event?.strength}, Symbol: {props.event?.symbol.toString()}){" "}
      </DialogTitle>
      <RebellionInCompanyControlled
        rebellionStrength={getRebellionStrength()}
        rebellingRegion={activeRebellionRegion}
        setRebellionOutcome={handleRebellionResolution}
      />
    </>
  );
};
