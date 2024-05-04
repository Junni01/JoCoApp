import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region, EventCard, RegionStatus, Rebellion } from "../../Types";
import { doesEmpireShatter } from "../../Helpers";
import { useState } from "react";
import { RebellionInCompanyControlled } from "./Rebellions";

export const LeaderEvent = (props: {
  drawStackRegion: Region;
  regions: Region[];
  event: EventCard;
  onOk: (rebellionOutcomes: Rebellion[]) => void;
}) => {
  const additionalCrises = props.regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  const handleNoCrisisOk = () => {
    props.onOk([]);
  };

  const handleCrisisOk = (rebellionOutcomes: Rebellion[]) => {
    props.onOk(rebellionOutcomes);
  };

  const renderDialogContent = () => {
    if (
      props.drawStackRegion.status === RegionStatus.Sovereign ||
      props.drawStackRegion.status === RegionStatus.EmpireCapital
    ) {
      return (
        <LeaderInSovereignAndCapital
          mainRegionName={props.drawStackRegion.id}
          onOk={handleNoCrisisOk}
        />
      );
    } else if (props.drawStackRegion.status === RegionStatus.Dominated) {
      return (
        <LeaderInDominated
          drawStackRegion={props.drawStackRegion}
          regions={props.regions}
          event={props.event}
          onOk={handleNoCrisisOk}
        />
      );
    } else if (
      props.drawStackRegion.status === RegionStatus.CompanyControlled
    ) {
      return (
        <LeaderInCompanyControlled
          drawStackRegion={props.drawStackRegion}
          event={props.event}
          additionalCrises={additionalCrises}
          handleConfirmResults={handleCrisisOk}
        />
      );
    } else {
      return null;
    }
  };

  return <Dialog open={true}>{renderDialogContent()}</Dialog>;
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
  event: EventCard;
  onOk: () => void;
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
  const rebellionStrength =
    props.drawStackRegion.towerLevel + props.event.strength;
  const dominatorStrength = dominator.towerLevel;
  const rebellionSuccessful = rebellionStrength > dominatorStrength;

  return (
    <>
      <DialogTitle>Event: Leader in {props.drawStackRegion.id}.</DialogTitle>
      <DialogContent>
        <Typography>
          Rebellion in dominated {props.drawStackRegion.id} against the capital{" "}
          {props.drawStackRegion.dominator}.
        </Typography>
        {rebellionSuccessful ? (
          <>
            <Typography>
              Rebellion in {props.drawStackRegion.id} is Successful, remove
              empire flag and close every open order in{" "}
              {props.drawStackRegion.id}. If all orders are already closed,
              perform a Cascade. The Region is now Sovereign.{" "}
            </Typography>
            {doesEmpireShatter(props.drawStackRegion, props.regions) && (
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
        <Button onClick={() => props.onOk()}>Ok</Button>
      </DialogActions>
    </>
  );
};

const LeaderInCompanyControlled = (props: {
  drawStackRegion: Region;
  event: EventCard;
  additionalCrises: Region[];
  handleConfirmResults: (rebellionResults: Rebellion[]) => void;
}) => {
  const [activeRebellionRegion, setActiveRebellionRegion] = useState<Region>(
    props.drawStackRegion
  );
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

    if (rebellionIndex + 1 > props.additionalCrises.length) {
      props.handleConfirmResults(rebellionOutcomes);
    } else {
      setActiveRebellionRegion(props.additionalCrises[rebellionIndex]);
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
      <DialogTitle>Event: Leader in {props.drawStackRegion.id}.</DialogTitle>
      <RebellionInCompanyControlled
        rebellionStrength={getRebellionStrength()}
        rebellingRegion={activeRebellionRegion}
        setRebellionOutcome={handleRebellionResolution}
      />
    </>
  );
};
