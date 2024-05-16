import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import {
  DeployType,
  Elephant,
  Presidency,
  Region,
  RegionName,
  RegionStatus,
} from "../Types";
import { calculateEmpireStrength, isValidDeployRegion } from "../Helpers";
import { useState } from "react";
import { DeployResult } from "./DeployResult";

type DeployDialogProps = {
  targetRegion: Region | undefined;
  regions: Region[];
  onConfirmResults: (
    type: DeployType,
    success: boolean,
    deployingPresidency: Presidency
  ) => void;
  onCancel: () => void;
  elephant: Elephant;
};

enum DeployPage {
  SelectPresidency,
  Deploy,
  Results,
}

export const DeployDialog = (props: DeployDialogProps) => {
  const [deployPage, setDeployPage] = useState<DeployPage>(
    DeployPage.SelectPresidency
  );
  const [deploySuccess, setDeploySuccess] = useState<boolean>(false);
  const [deployingPresidency, setDeployingResidency] = useState<Presidency>(
    props.targetRegion?.controllingPresidency ?? Presidency.BengalPresidency
  );

  if (!props.targetRegion) {
    console.error("DeployDialog: Target region is undefined");
    return;
  }

  const targetRegion = props.targetRegion;

  const getDeployType = (targetRegion: Region) => {
    if (
      targetRegion.status === RegionStatus.CompanyControlled &&
      targetRegion.unrest > 0
    ) {
      return DeployType.CompanyControlledWithUnrest;
    } else if (
      targetRegion.status === RegionStatus.CompanyControlled &&
      targetRegion.unrest === 0
    ) {
      return DeployType.CompanyControlledWithoutUnrest;
    } else if (targetRegion.status === RegionStatus.Sovereign) {
      return DeployType.Sovereign;
    } else if (targetRegion.status === RegionStatus.Dominated) {
      return DeployType.Dominated;
    } else {
      return DeployType.EmpireCapital;
    }
  };

  const isDeployAllowed = () => {
    if (!props.targetRegion) {
      console.error("DeployDialog: Target region is undefined");
      return false;
    }
    if (targetRegion.status === RegionStatus.CompanyControlled) {
      return targetRegion.controllingPresidency === deployingPresidency;
    } else {
      return isValidDeployRegion(
        deployingPresidency,
        targetRegion,
        props.regions
      );
    }
  };

  const isAnotherPresidentsHomeRegion = () => {
    if (
      (targetRegion.id === RegionName.Bengal &&
        deployingPresidency !== Presidency.BengalPresidency) ||
      (targetRegion.id === RegionName.Bombay &&
        deployingPresidency !== Presidency.BombayPresidency) ||
      (targetRegion.id === RegionName.Madras &&
        deployingPresidency !== Presidency.MadrasPresidency)
    ) {
      return true;
    }

    return false;
  };

  const getResistanceStrength = () => {
    switch (targetRegion.status) {
      case RegionStatus.CompanyControlled:
        return 0;
      case RegionStatus.Sovereign:
        return targetRegion.towerLevel;
      case RegionStatus.Dominated:
        return calculateEmpireStrength(targetRegion.id, props.regions);
      case RegionStatus.EmpireCapital:
        return calculateEmpireStrength(targetRegion.id, props.regions);
      default:
        return 0;
    }
  };

  const DeployMessage = () => {
    if (
      deployType === DeployType.CompanyControlledWithoutUnrest &&
      targetRegion.controllingPresidency === deployingPresidency
    ) {
      return (
        <Typography>
          This is a company controlled region that has no unrest, you can deploy
          if it has closed orders that you can open. Otherwise deploying to this
          region is not allowed.
        </Typography>
      );
    }

    if (
      deployType === DeployType.CompanyControlledWithUnrest ||
      deployType === DeployType.CompanyControlledWithoutUnrest
    ) {
      if (props.targetRegion?.controllingPresidency !== deployingPresidency) {
        return (
          <Typography>
            This region is controlled by{" "}
            {props.targetRegion?.controllingPresidency}, you are not allowed to
            deploy to another presidency's region
          </Typography>
        );
      }
    } else {
      if (isAnotherPresidentsHomeRegion()) {
        return (
          <Typography>
            You cannot deploy to another presidency's home region
          </Typography>
        );
      }

      if (!props.targetRegion) {
        console.error("DeployDialog: Target region is undefined");
        return "";
      }

      if (
        !isValidDeployRegion(
          deployingPresidency,
          props.targetRegion,
          props.regions
        )
      ) {
        return (
          <Typography>
            You cannot deploy to a region that is not adjacent to a region that
            is controlled by your presidency or is not your home region
          </Typography>
        );
      }
    }
  };

  const handleSuccessfulDeploy = () => {
    setDeployPage(DeployPage.Results);
    setDeploySuccess(true);
  };

  const handleFailedDeploy = () => {
    setDeployPage(DeployPage.Results);
    setDeploySuccess(false);
  };

  const handleConfirmResults = () => {
    props.onConfirmResults(deployType, deploySuccess, deployingPresidency);
  };

  const renderDeployPage = () => {
    switch (deployPage) {
      case DeployPage.SelectPresidency:
        return (
          <>
            <DialogContent>
              <FormControl>
                <FormLabel>Select Deploying Presidency: </FormLabel>
                <RadioGroup
                  onChange={(e) => {
                    setDeployingResidency(e.target.value as Presidency);
                  }}
                  value={deployingPresidency}
                >
                  <FormControlLabel
                    value={Presidency.BengalPresidency}
                    control={<Radio />}
                    label={"Bengal Presidency"}
                  />
                  <FormControlLabel
                    value={Presidency.BombayPresidency}
                    control={<Radio />}
                    label={"Bombay Presidency"}
                  />
                  <FormControlLabel
                    value={Presidency.MadrasPresidency}
                    control={<Radio />}
                    label={"Madras Presidency"}
                  />
                </RadioGroup>
              </FormControl>
              <DeployMessage />
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                disabled={!isDeployAllowed()}
                onClick={() => setDeployPage(DeployPage.Deploy)}
              >
                Next
              </Button>
              <Button variant="outlined" onClick={props.onCancel}>
                Cancel
              </Button>
            </DialogActions>
          </>
        );
      case DeployPage.Deploy:
        return (
          <>
            <DeployDialogContent
              deployType={deployType}
              presidency={deployingPresidency}
              defenseStrength={getResistanceStrength()}
            />
            <DialogActions>
              <Button variant="contained" onClick={handleSuccessfulDeploy}>
                Deploy Successful
              </Button>
              <Button variant="contained" onClick={handleFailedDeploy}>
                Deploy Failed
              </Button>
            </DialogActions>
          </>
        );
      case DeployPage.Results:
        return (
          <>
            <DialogContent>
              <DeployResult
                targetRegion={props.targetRegion}
                regions={props.regions}
                deploySuccessful={deploySuccess}
                elephant={props.elephant}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={handleConfirmResults}>
                Confirm
              </Button>
            </DialogActions>
          </>
        );
    }
  };

  const deployType = getDeployType(props.targetRegion);

  return (
    <Dialog open={true} fullWidth maxWidth={"md"}>
      <DialogTitle>Deploy to {props.targetRegion.id}</DialogTitle>
      {renderDeployPage()}
    </Dialog>
  );
};

const DeployDialogContent = (props: {
  deployType: DeployType;
  presidency: Presidency;
  defenseStrength: number;
}) => {
  return (
    <>
      <Typography>This regions strength is {props.defenseStrength}</Typography>

      <List>
        <ListItem>
          <Typography>
            <b>Exhaust Pieces:</b> Exhaust Officers and Regiments in{" "}
            {props.presidency} Army to add to your dice pool. Each exhausted
            piece adds 1 die to your pool.
          </Typography>
        </ListItem>
        <ListItem>
          <Typography>
            <b>Local Alliances:</b> Exhaust Local Alliances in{" "}
            {props.presidency} Army to add to your dice pool. Each exhausted
            Local Alliance give you the number of dice indicated on the piece.
          </Typography>
        </ListItem>
        <ListItem>
          <Typography>
            <b>Check:</b> Subtract {props.defenseStrength} dice from your pool
            and make a check.
          </Typography>
        </ListItem>
      </List>
    </>
  );
};

export { DeployType };
