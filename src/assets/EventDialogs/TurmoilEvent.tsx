import { DialogContent, DialogTitle, Typography } from "@mui/material";
import { Region } from "../../Types";

export const TurmoilEvent = (props: { drawStackRegion: Region }) => {
  return (
    <>
      <DialogTitle>Event: Turmoil in {props.drawStackRegion.id}</DialogTitle>
      <DialogContent>
        <Typography>
          Close northernmost open order in {props.drawStackRegion.id}. Any
          writer on the order is returned to that player's supply. If all orders
          in this region are already closed, perform a Cascade.
        </Typography>
      </DialogContent>
    </>
  );
};
