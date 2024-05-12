import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
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
} from "./Types";
import {
  calculateEmpireStrength,
  doesLossOfRegionCauseEmpireShatter,
  getEmpireDominatedRegionIds,
  isValidDeployRegion,
} from "./Helpers";
import { useState } from "react";
import { bengal, bombay, madras } from "./Data";
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

export const DeployDialog = (props: DeployDialogProps) => {
  const [showResults, setShowResults] = useState<boolean>(false);
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
      targetRegion.id === RegionName.Bengal ||
      targetRegion.id === RegionName.Bombay ||
      targetRegion.id === RegionName.Madras
    ) {
      return true;
    }

    return false;
  };

  const deployNotAllowedMessage = (deployType: DeployType) => {
    if (
      deployType === DeployType.CompanyControlledWithUnrest ||
      deployType === DeployType.CompanyControlledWithoutUnrest
    ) {
      if (props.targetRegion?.controllingPresidency !== deployingPresidency) {
        return `This region is controlled by ${props.targetRegion?.controllingPresidency}, you are not allowed to deploy to another presidency's region`;
      }
    } else {
      if (isAnotherPresidentsHomeRegion()) {
        return `You cannot deploy to another presidency's home region`;
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
        return `You cannot deploy to a region that is not adjacent to a region that is controlled by your presidency or is not your home region`;
      }
    }
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

  const handleSuccessfulDeploy = () => {
    setShowResults(true);
    setDeploySuccess(true);
  };

  const handleFailedDeploy = () => {
    setShowResults(true);
    setDeploySuccess(false);
  };

  const deployType = getDeployType(props.targetRegion);

  return (
    <Dialog open={true}>
      <DialogTitle>Deploy to {props.targetRegion.id}</DialogTitle>
      <DialogContent>
        {showResults ? (
          <DeployResult
            targetRegion={props.targetRegion}
            regions={props.regions}
            deploySuccessful={deploySuccess}
          />
        ) : (
          <>
            <FormControl>
              <FormLabel>Presidency: </FormLabel>
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
            {!isDeployAllowed() ? (
              <Typography>{deployNotAllowedMessage(deployType)}</Typography>
            ) : (
              <DeployDialogContent
                deployType={deployType}
                defenseStrength={getResistanceStrength()}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {showResults ? (
          <Button
            variant="contained"
            onClick={() =>
              props.onConfirmResults(
                deployType,
                deploySuccess,
                deployingPresidency
              )
            }
          >
            Confirm
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              disabled={!isDeployAllowed()}
              onClick={handleSuccessfulDeploy}
            >
              Deploy Successful
            </Button>
            <Button
              variant="contained"
              disabled={!isDeployAllowed()}
              onClick={handleFailedDeploy}
            >
              Deploy Failed
            </Button>
          </>
        )}
        <Button variant="outlined" onClick={props.onCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeployDialogContent = (props: {
  deployType: DeployType;
  defenseStrength: number;
}) => {
  if (props.deployType === DeployType.CompanyControlledWithUnrest) {
    return (
      <>
        <Typography>
          Deploying to company controlled region with unrest tokens.
        </Typography>
        <Typography>
          Exhaust troops to add to you dice pool, and make a check.
        </Typography>
      </>
    );
  }
  if (props.deployType === DeployType.CompanyControlledWithoutUnrest) {
    return (
      <>
        <Typography>
          This is a company controlled region that has no unrest, you can deploy
          if it has closed orders that you can open. Otherwise deploying to this
          region is not allowed.
        </Typography>
        <Typography>
          Exhaust troops to add to you dice pool, and make a check.
        </Typography>
      </>
    );
  }
  if (props.deployType === DeployType.Sovereign) {
    return (
      <>
        <Typography>
          This regions strength is {props.defenseStrength}
        </Typography>
        <Typography>
          Exhaust troops to add to you dice pool. Subtract{" "}
          {props.defenseStrength} dice from your pool and make a check.
        </Typography>
      </>
    );
  }

  if (props.deployType === DeployType.Dominated) {
    return (
      <>
        <Typography>
          This Empire's strength is {props.defenseStrength}
        </Typography>
        <Typography>
          Exhaust troops to add to you dice pool. Subtract{" "}
          {props.defenseStrength} dice from your pool and make a check.
        </Typography>
      </>
    );
  }
  if (props.deployType === DeployType.EmpireCapital) {
    return (
      <>
        <Typography>
          This Empire's strength is {props.defenseStrength}
        </Typography>
        <Typography>
          Exhaust troops to add to you dice pool. Subtract{" "}
          {props.defenseStrength} dice from your pool and make a check.
        </Typography>
      </>
    );
  }
};

export { DeployType };
