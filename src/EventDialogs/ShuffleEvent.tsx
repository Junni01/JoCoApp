import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { EventDialog } from "../DialogStyles";
import { useContext } from "react";
import { GlobalEffectsContext } from "../GlobalEffectsContext";
import { shuffleEventPile } from "../Helpers";

export const ShuffleEvent = (props: { onOk: () => void }) => {
  const {
    activeEvent,
    setActiveEvent,
    eventDeck,
    setEventDeck,
    eventDiscardPile,
    setEventDiscardPile,
    executeElephantsMarch,
  } = useContext(GlobalEffectsContext);

  const executeShuffleEvent = () => {
    const events = [...eventDeck];
    const shuffleEvent = activeEvent;
    if (!shuffleEvent) {
      console.error("active event is undefined");
      return;
    }

    let elephantsMarchExecuted: boolean = false;

    if (eventDeck.length !== 0) {
      console.log("Shuffle Event: Elephants March executed before shuffle");
      executeElephantsMarch(false);
      elephantsMarchExecuted = true;
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
    setEventDeck([...events]);
    setEventDiscardPile([]);

    setActiveEvent(undefined);

    if (!elephantsMarchExecuted) {
      console.log("Shuffle Event: Elephants March executed after shuffle");
      executeElephantsMarch(false);
    }
    props.onOk();
  };

  return (
    <EventDialog>
      <DialogTitle>Event: Shuffle</DialogTitle>
      <DialogContent>
        <Typography>
          Shuffle event is shuffled into the draw stack and discard pile is
          shuffled and put on top of the draw stack
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => executeShuffleEvent()}>Ok</Button>
      </DialogActions>
    </EventDialog>
  );
};
