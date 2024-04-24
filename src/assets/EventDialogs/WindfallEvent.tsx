import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region } from "../../Types";

export const WindfallEvent = (props: {
  drawStackRegion: Region;
  onOk: () => void;
}) => {
  return (
    <Dialog open={true}>
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
    </Dialog>
  );
};
