import { DialogContent, DialogTitle, Typography } from "@mui/material";
import { Region, EventCard, RegionStatus } from "../../Types";

export const LeaderEvent = (props: {
  drawStackRegion: Region;
  regions: Region[];
  event: EventCard;
}) => {
  if (
    props.drawStackRegion.status === RegionStatus.Sovereign ||
    props.drawStackRegion.status === RegionStatus.EmpireCapital
  ) {
    return (
      <>
        <DialogTitle>Event: Leader in ${props.drawStackRegion.id}.</DialogTitle>
        <DialogContent>
          <Typography>The region's strength grows</Typography>
          <Typography>
            Add 1 tower level to {props.drawStackRegion.id}
          </Typography>
        </DialogContent>
      </>
    );
  } else if (props.drawStackRegion.status === RegionStatus.Dominated) {
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
        <DialogTitle>Event: Leader in ${props.drawStackRegion.id}.</DialogTitle>
        <DialogContent>
          <Typography>
            Rebellion in dominated {props.drawStackRegion.id} against the
            capital {props.drawStackRegion.dominator}.
          </Typography>
          {rebellionSuccessful ? (
            <Typography>
              Rebellion in {props.drawStackRegion.id} is Successful, remove
              empire flag and close every open order in{" "}
              {props.drawStackRegion.id}. If all orders are already closed,
              perform a Cascade. The Region is now Sovereign.{" "}
            </Typography>
          ) : (
            <Typography>
              Rebellion in {props.drawStackRegion.id} failed. Remove one tower
              level from {dominator.id}.
            </Typography>
          )}
        </DialogContent>
      </>
    );
  } else if (props.drawStackRegion.status === RegionStatus.CompanyControlled) {
    const additionalCrises = props.regions.filter(
      (r) => r.status === RegionStatus.CompanyControlled && r.unrest > 0
    );

    return (
      <>
        <DialogTitle>Event: Leader in ${props.drawStackRegion.id}.</DialogTitle>
        <DialogContent>
          <Typography>
            Rebellion in {props.drawStackRegion.id} against the company. The
            rebellion strength is{" "}
            {props.drawStackRegion.unrest + props.event.strength}
          </Typography>
          {additionalCrises.length > 0 && (
            <Typography>
              Additional Crises in {additionalCrises.map((r) => r.id).join(",")}
            </Typography>
          )}
        </DialogContent>
      </>
    );
  } else {
    return;
  }
};
