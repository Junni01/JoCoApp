import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { marchElephant } from "../Helpers";
import { Region, EventCard, Elephant, RegionStatus } from "../Types";
import { EventDialog } from "../DialogStyles";
import { useContext } from "react";
import { GlobalEffectsContext } from "../GlobalEffectsContext";

export const PeaceEvent = (props: { onOk: () => void }) => {
  const {
    regions,
    elephant,
    drawStackRegion,
    activeEvent,
    setRegions,
    executeElephantsMarch,
    discardEvent,
  } = useContext(GlobalEffectsContext);

  if (activeEvent === undefined) {
    console.error("active event is undefined");
    return null;
  }

  const newElephantRegion = marchElephant(
    drawStackRegion,
    regions,
    activeEvent.symbol
  );

  const mainRegion = regions.find((r) => r.id === elephant.MainRegion);
  const targetRegion = regions.find((r) => r.id === elephant.TargetRegion);

  const executePeaceNoTargetRegion = () => {
    if (!mainRegion) {
      console.error("Main region is undefined");
      return;
    }
    mainRegion.unrest = 0;
    const newRegionArray = regions.filter((r) => r.id !== mainRegion.id);
    setRegions([...newRegionArray, mainRegion]);
    executeElephantsMarch(false);
    discardEvent();
    props.onOk();
  };

  const executePeaceWithTargetRegion = () => {
    if (!mainRegion || !targetRegion) {
      console.error("Main or Target region is undefined");
      return;
    }
    const newRegionArray = regions.filter(
      (r) => r.id !== targetRegion?.id && r.id !== mainRegion?.id
    );
    mainRegion.towerLevel++;
    if (targetRegion?.status !== RegionStatus.CompanyControlled) {
      targetRegion.towerLevel++;
    }
    setRegions([...newRegionArray, mainRegion, targetRegion]);
    executeElephantsMarch(false);
    discardEvent();
    props.onOk();
  };

  if (elephant.TargetRegion !== undefined) {
    return (
      <EventDialog>
        <DialogTitle>
          Event: Peace between <b>{elephant.MainRegion}</b> and{" "}
          <b>{elephant.TargetRegion}</b>
        </DialogTitle>

        <DialogContent>
          <List>
            <ListItem>
              <Typography>
                Open all orders that are connected through the border between{" "}
                <b>{elephant.MainRegion}</b> and <b>{elephant.TargetRegion}</b>
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Add one tower level to <b>{elephant.MainRegion}</b>{" "}
                {targetRegion?.status === RegionStatus.CompanyControlled ? (
                  ""
                ) : (
                  <>
                    and <b>{elephant.TargetRegion}</b>
                  </>
                )}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Place elephant on <b>{newElephantRegion?.MainRegion}</b>{" "}
                {!newElephantRegion?.TargetRegion ? (
                  ""
                ) : (
                  <>
                    and face it towards <b>{newElephantRegion.TargetRegion}</b>
                  </>
                )}
              </Typography>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => executePeaceWithTargetRegion()}>Ok</Button>
        </DialogActions>
      </EventDialog>
    );
  } else {
    return (
      <EventDialog>
        <DialogTitle>
          Event: Peace in <b>{elephant.MainRegion}</b>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Open all orders and remove unrest in <b>{elephant.MainRegion}</b>
          </Typography>
          <Typography>
            Place elephant on <b>{newElephantRegion?.MainRegion}</b>{" "}
            {!newElephantRegion?.TargetRegion ? (
              ""
            ) : (
              <>
                and face it towards <b>{newElephantRegion.TargetRegion}</b>
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => executePeaceNoTargetRegion()}>Ok</Button>
        </DialogActions>
      </EventDialog>
    );
  }
};
