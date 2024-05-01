import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { Region, EventCard, RegionStatus, Rebellion } from "../../Types";
import { doesEmpireShatter } from "../../Helpers";
import { useState } from "react";

export const LeaderEvent = (props: {
  drawStackRegion: Region;
  regions: Region[];
  event: EventCard;
  onOk: (mainCrisisWon: boolean, rebellions: Rebellion[]) => void;
}) => {
  const additionalCrises = props.regions.filter(
    (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
  );

  const [rebellions, setRebellions] = useState<Rebellion[]>(
    additionalCrises.map(
      (r) => ({ Region: r, RebellionSuccessful: false } as Rebellion)
    )
  );
  const [mainCrisisWon, setMainCrisisWon] = useState<boolean>(false);

  const handleResolveCrisis = (
    Region: Region,
    RebellionSuccessful: boolean
  ) => {
    const rebellion = rebellions.find((r) => r.Region === Region);
    if (rebellion) {
      rebellion.RebellionSuccessful = RebellionSuccessful;
      setRebellions([...rebellions]);
    }
  };

  const renderDialogContent = () => {
    if (
      props.drawStackRegion.status === RegionStatus.Sovereign ||
      props.drawStackRegion.status === RegionStatus.EmpireCapital
    ) {
      return (
        <LeaderInSovereignAndCapital
          mainRegionName={props.drawStackRegion.id}
        />
      );
    } else if (props.drawStackRegion.status === RegionStatus.Dominated) {
      return (
        <LeaderInDominated
          drawStackRegion={props.drawStackRegion}
          regions={props.regions}
          event={props.event}
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
          mainCrisisWon={mainCrisisWon}
          setMainCrisisWon={setMainCrisisWon}
          handleResolveCrisis={handleResolveCrisis}
          rebellions={rebellions}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <Dialog open={true}>
      {renderDialogContent()}
      <DialogActions>
        <Button onClick={() => props.onOk(mainCrisisWon, rebellions)}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const LeaderInSovereignAndCapital = (props: { mainRegionName: string }) => {
  return (
    <>
      <DialogTitle>Event: Leader in {props.mainRegionName}.</DialogTitle>
      <DialogContent>
        <Typography>The region's strength grows</Typography>
        <Typography>Add 1 tower level to {props.mainRegionName}</Typography>
      </DialogContent>
    </>
  );
};

const LeaderInDominated = (props: {
  drawStackRegion: Region;
  regions: Region[];
  event: EventCard;
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
    </>
  );
};

const LeaderInCompanyControlled = (props: {
  drawStackRegion: Region;
  event: EventCard;
  additionalCrises: Region[];
  setMainCrisisWon: (won: boolean) => void;
  mainCrisisWon: boolean | undefined;
  handleResolveCrisis: (Region: Region, RebellionSuccessful: boolean) => void;
  rebellions: Rebellion[];
}) => {
  return (
    <>
      <DialogTitle>Event: Leader in {props.drawStackRegion.id}.</DialogTitle>
      <DialogContent>
        <Typography>
          Rebellion in {props.drawStackRegion.id} against the company. The
          rebellion strength is{" "}
          {props.drawStackRegion.unrest + props.event.strength}
          Exhaust troops in {props.drawStackRegion.controllingPresidency} army
          to suppress the rebellion.
        </Typography>
        <FormControl>
          <RadioGroup
            name="controlled-radio-buttons-group"
            value={props.mainCrisisWon}
            onChange={(e) => props.setMainCrisisWon(e.target.value === "true")}
          >
            <FormControlLabel
              value={true}
              control={<Radio />}
              label="Rebellion Suppressed"
            />
            <FormControlLabel
              value={false}
              control={<Radio />}
              label="Rebellion Succeeded"
            />
          </RadioGroup>
        </FormControl>
        {props.additionalCrises.length > 0 && (
          <Typography>Additional Crises regions with unrest</Typography>
        )}
        Additional Crises in{" "}
        {props.additionalCrises.map((r) => (
          <>
            <Typography>
              Rebellion in {r.id}, rebellion strength is {r.unrest}
            </Typography>
            <Typography>
              Exhaust troops in {props.drawStackRegion.controllingPresidency}{" "}
              army to suppress the rebellion.
            </Typography>
            <FormControl>
              <RadioGroup
                name="controlled-radio-buttons-group"
                value={
                  props.rebellions.find((rebellion) => rebellion.Region === r)
                    ?.RebellionSuccessful
                }
                onChange={(e) =>
                  props.handleResolveCrisis(r, e.target.value === "true")
                }
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Rebellion Suppressed"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="Rebellion Succeeded"
                />
              </RadioGroup>
            </FormControl>
          </>
        ))}
      </DialogContent>
    </>
  );
};
