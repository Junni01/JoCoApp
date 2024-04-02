import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region, RegionStatus } from "./Types";
import { calculateEmpireStrength } from "./Helpers";

type DeployDialogProps = {
  targetRegion: Region | undefined;
  regions: Region[];
  onOk: () => void;
};

export const DeployDialog = (props: DeployDialogProps) => {
  if (!props.targetRegion) {
    console.error("DeployDialog: Target region is undefined");
    return;
  }

  if (
    props.targetRegion.status === RegionStatus.CompanyControlled &&
    props.targetRegion.unrest > 0
  ) {
    return (
      <Dialog open={true}>
        <DialogTitle>Deploy to {props.targetRegion.id}</DialogTitle>
        <DialogContent>
          <Typography>
            Deploying to company controlled region with unrest
          </Typography>
          <Typography>
            Exhaust troops to add to you dice pool, unrest does not subtract
            from your dice.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOk}>Deploy action successful</Button>
          <Button onClick={props.onOk}>Deploy action failed</Button>
          <Button onClick={props.onOk}>Cancel Deploy Action</Button>
        </DialogActions>
      </Dialog>
    );
  } else if (
    props.targetRegion.status === RegionStatus.CompanyControlled &&
    props.targetRegion.unrest === 0
  ) {
    return (
      <Dialog open={true}>
        <DialogTitle>Deploy to {props.targetRegion.id}</DialogTitle>
        <DialogContent>
          <Typography>
            This is a company controlled region that has no unrest, you can
            deploy if it has closed orders that you can open. Otherwise
            deploying to this region is not allowed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOk}>Deploy to Region</Button>
          <Button>Cancel Deploy action</Button>
        </DialogActions>
      </Dialog>
    );
  } else if (props.targetRegion.status === RegionStatus.Sovereign) {
    return (
      <Dialog open={true}>
        <DialogTitle>Deploy to {props.targetRegion.id}</DialogTitle>
        <DialogContent>
          <Typography>
            This regions strength is {props.targetRegion.towerLevel}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOk}>Ok</Button>
        </DialogActions>
      </Dialog>
    );
  } else {
    let totalStrength = calculateEmpireStrength(
      props.targetRegion.id,
      props.regions
    );
    return (
      <Dialog open={true}>
        <DialogTitle>Deploy to {props.targetRegion.id}</DialogTitle>
        <DialogContent>
          <Typography>This Empire's strength is {totalStrength}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOk}>Ok</Button>
        </DialogActions>
      </Dialog>
    );
  }
};
