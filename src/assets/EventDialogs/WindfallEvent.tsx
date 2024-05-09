import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region } from "../../Types";
import { EventDialog } from "../../DialogStyles";

export const WindfallEvent = (props: {
  drawStackRegion: Region;
  onOk: () => void;
}) => {
  return (
    <EventDialog>
      <DialogTitle>Event: Windfall in {props.drawStackRegion.id}</DialogTitle>
      <DialogContent>
        <Typography>
          Players take 1£ for each writer they have on:{" "}
          <b>
            {props.drawStackRegion.id},{" "}
            {props.drawStackRegion.neighbors.map((r) => r.regionId).join(", ")}
          </b>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onOk()}>Ok</Button>
      </DialogActions>
    </EventDialog>
  );
};
