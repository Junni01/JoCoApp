import { DialogContent, DialogTitle, Typography } from "@mui/material";
import { Region } from "../../Types";

export const WindfallEvent = (props: { drawStackRegion: Region }) => {
  return (
    <>
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
    </>
  );
};
