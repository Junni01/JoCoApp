import { Button, Dialog, DialogActions, Typography } from "@mui/material";
import { Elephant, EventCard, EventType, Region } from "./Types";
import { PeaceEvent } from "./assets/EventDialogs/PeaceEvent";
import { CrisisEvent } from "./assets/EventDialogs/CrisisEvent";
import { LeaderEvent } from "./assets/EventDialogs/LeaderEvent";
import { ShuffleEvent } from "./assets/EventDialogs/ShuffleEvent";
import { TurmoilEvent } from "./assets/EventDialogs/TurmoilEvent";
import { WindfallEvent } from "./assets/EventDialogs/WindfallEvent";

type EvenDialogProps = {
  event: EventCard;
  drawStackRegion: Region;
  regions: Region[];
  elephant: Elephant;
  onOk: () => void;
};

export const EventDialog = (props: EvenDialogProps) => {
  const renderDialogContent = () => {
    switch (props.event.type) {
      case EventType.Shuffle:
        return <ShuffleEvent />;
      case EventType.Windfall:
        return <WindfallEvent drawStackRegion={props.drawStackRegion} />;
      case EventType.Turmoil:
        return <TurmoilEvent drawStackRegion={props.drawStackRegion} />;
      case EventType.Leader:
        return (
          <LeaderEvent
            drawStackRegion={props.drawStackRegion}
            event={props.event}
            regions={props.regions}
          />
        );
      case EventType.Peace:
        return (
          <PeaceEvent
            drawStackRegion={props.drawStackRegion}
            regions={props.regions}
            event={props.event}
            elephant={props.elephant}
          />
        );
      case EventType.ResolveCrisis:
        return (
          <CrisisEvent
            regions={props.regions}
            elephant={props.elephant}
            event={props.event}
          />
        );
      case EventType.ForeignInvasion:
        return <Typography>Foreign Invasion</Typography>;

      default:
        return <Typography>Default Case</Typography>;
    }
  };

  return (
    <Dialog open={true}>
      {renderDialogContent()}
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};
