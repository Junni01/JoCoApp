import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { EventDeck, StormDie } from "./Data";
import { EventDialog } from "./DialogStyles";
import { useContext, useState } from "react";
import { SeaZone, RegionName } from "./Types";
import { GlobalEffectsContext } from "./GlobalEffectsContext";

export const EventsInIndiaDialog = (props: { onOk: () => void }) => {
  enum EventPhase {
    Start,
    Roll,
    Seas,
    Events,
  }

  const [phase, setPhase] = useState<EventPhase>(EventPhase.Start);
  const [stormDie, setStormDie] = useState(StormDie[0]);
  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { setEventTotal } = globalEffectsContext;

  const rollStormDie = () => {
    return StormDie[Math.floor(Math.random() * 6)];
  };
  const handleRoll = () => {
    setEventTotal(0);
    setStormDie(rollStormDie());
    setPhase(EventPhase.Roll);
  };

  const handleConfirmEventsPhase = () => {
    setEventTotal(stormDie.EventNumber);
    props.onOk();
  };

  const renderSeaMessage = () => {
    switch (stormDie.Sea) {
      case SeaZone.None:
        return <Typography>The seas are calm</Typography>;
      case SeaZone.All:
        return (
          <Typography>
            Storms in all seas: Roll for ships in all three sea zones
          </Typography>
        );
      case SeaZone.EastSea:
        return (
          <Typography>
            Storms in the East Sea: Roll for ships in the East Sea (Including
            ships in China)
          </Typography>
        );
      case SeaZone.WestSea:
        return (
          <Typography>
            Storms in the West Sea: Roll for ships in the West Sea
          </Typography>
        );
      case SeaZone.SouthSea:
        return (
          <Typography>
            Storms in the South Sea: Roll for ships in the South Sea
          </Typography>
        );
    }
  };

  const renderEventContent = () => {
    switch (phase) {
      case EventPhase.Start:
        return (
          <>
            <DialogContent>
              <Typography>
                Roll the storm die to determine the weather and events in india
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRoll}>Roll</Button>
              <Button onClick={props.onOk}>Cancel</Button>
            </DialogActions>
          </>
        );
      case EventPhase.Roll:
        return (
          <>
            <DialogContent>
              <Typography>Sea: {stormDie.Sea}</Typography>
              <Typography>Events: {stormDie.EventNumber}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPhase(EventPhase.Seas)}>Next</Button>
            </DialogActions>
          </>
        );
      case EventPhase.Seas:
        return (
          <>
            <DialogContent>{renderSeaMessage()}</DialogContent>
            <DialogActions>
              <Button onClick={() => setPhase(EventPhase.Events)}>Next</Button>
            </DialogActions>
          </>
        );
      case EventPhase.Events:
        return (
          <>
            <DialogContent>
              {stormDie.EventNumber === 1 && (
                <Typography>Resolve 1 event in India</Typography>
              )}
              {stormDie.EventNumber > 1 && (
                <Typography>
                  Resolve {stormDie.EventNumber} events in India
                </Typography>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => handleConfirmEventsPhase()}>Done</Button>
            </DialogActions>
          </>
        );
    }
  };

  return (
    <EventDialog>
      <DialogTitle>Events in India</DialogTitle>
      {renderEventContent()}
    </EventDialog>
  );
};
