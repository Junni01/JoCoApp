import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region } from "../Types";
import { EventDialog } from "../DialogStyles";
import { useContext } from "react";
import { GlobalEffectsContext } from "../GlobalEffectsContext";

export const TurmoilEvent = (props: { onOk: () => void }) => {
  const { drawStackRegion, discardEvent } = useContext(GlobalEffectsContext);

  const executeEvent = () => {
    discardEvent();
    props.onOk();
  };

  return (
    <EventDialog>
      <DialogTitle>Event: Turmoil in {drawStackRegion.id}</DialogTitle>
      <DialogContent>
        <Typography>
          Close northernmost open order in <b>{drawStackRegion.id}</b>. Any
          writer on the order is returned to that player's supply. If all orders
          in this region are already closed, perform a Cascade.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => executeEvent()}>Ok</Button>
      </DialogActions>
    </EventDialog>
  );
};
