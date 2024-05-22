import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { Region } from "../Types";
import { EventDialog } from "../DialogStyles";
import { useContext } from "react";
import { GlobalEffectsContext } from "../GlobalEffectsContext";

export const WindfallEvent = (props: { onOk: () => void }) => {
  const { drawStackRegion, discardEvent } = useContext(GlobalEffectsContext);

  const executeEvent = () => {
    discardEvent();
    props.onOk();
  };

  return (
    <EventDialog>
      <DialogTitle>Event: Windfall in {drawStackRegion.id}</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <Typography>
              Players take 1£ for each writer they have on:{" "}
              <b>
                {drawStackRegion.id},{" "}
                {drawStackRegion.neighbors.map((r) => r.regionId).join(", ")}
              </b>
            </Typography>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => executeEvent()}>Ok</Button>
      </DialogActions>
    </EventDialog>
  );
};
