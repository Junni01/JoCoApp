import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region } from "../../Types";

export const TurmoilEvent = (props: {
  drawStackRegion: Region;
  onOk: () => void;
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{ sx: { ml: "1000px" } }}
      hideBackdrop
      draggable
    >
      <DialogTitle>Event: Turmoil in {props.drawStackRegion.id}</DialogTitle>
      <DialogContent>
        <Typography>
          Close northernmost open order in <b>{props.drawStackRegion.id}</b>.
          Any writer on the order is returned to that player's supply. If all
          orders in this region are already closed, perform a Cascade.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onOk()}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};
