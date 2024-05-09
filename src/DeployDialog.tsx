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
  RegionStatus,
} from "./Types";
import {
  calculateEmpireStrength,
  doesLossOfRegionCauseEmpireShatter,
  getEmpireDominatedRegionIds,
} from "./Helpers";
import { useState } from "react";
import { bengal, bombay, madras } from "./Data";

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
    if (targetRegion.status === RegionStatus.CompanyControlled) {
      return targetRegion.controllingPresidency === deployingPresidency;
    } else {
      switch (deployingPresidency) {
        case Presidency.BengalPresidency:
          return targetRegion.id !== madras.id && targetRegion.id !== bombay.id;

        case Presidency.MadrasPresidency:
          return targetRegion.id !== bengal.id && targetRegion.id !== bombay.id;

        case Presidency.BombayPresidency:
          return targetRegion.id !== madras.id && targetRegion.id !== bengal.id;
      }
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
          <>
            <Typography>
              Check for losses: Each player must roll a die for each of their
              officers that were exhausted in this action (never regiments!).
              For each 6 rolled, they must return one of their officers to their
              supply.
            </Typography>
            {deploySuccess ? (
              <>
                <DeploySuccessfulResultDialog
                  targetRegion={props.targetRegion}
                  IsSuccess={deploySuccess}
                  regions={props.regions}
                  deployType={deployType}
                />
                {props.elephant.MainRegion === props.targetRegion.id &&
                  !!props.elephant.TargetRegion && (
                    <Typography>
                      Elephant Redirect: Place elephant in the middle of{" "}
                      {props.targetRegion.id}
                    </Typography>
                  )}
              </>
            ) : (
              <>
                <Typography>
                  If the Deploy action is a catastrophic failure, first return
                  half (rounding up) of your trophies to the supply and return
                  the Commander to your supply.
                </Typography>
              </>
            )}
          </>
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
            <DeployDialogContent
              deployType={deployType}
              targetRegion={props.targetRegion}
              regions={props.regions}
              isDeployAllowed={isDeployAllowed()}
            />
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
  targetRegion: Region;
  regions: Region[];
  isDeployAllowed: boolean;
}) => {
  if (props.deployType === DeployType.CompanyControlledWithUnrest) {
    return (
      <>
        {props.isDeployAllowed ? (
          <>
            <Typography>
              Deploying to company controlled region with unrest tokens.
            </Typography>
            <Typography>
              Exhaust troops to add to you dice pool, and make a check.
            </Typography>
          </>
        ) : (
          <Typography>
            This presidency is not controlling this region, you cannot deploy to
            another presidency's region
          </Typography>
        )}
      </>
    );
  }
  if (props.deployType === DeployType.CompanyControlledWithoutUnrest) {
    return (
      <>
        {props.isDeployAllowed ? (
          <>
            <Typography>
              This is a company controlled region that has no unrest, you can
              deploy if it has closed orders that you can open. Otherwise
              deploying to this region is not allowed.
            </Typography>
            <Typography>
              Exhaust troops to add to you dice pool, and make a check.
            </Typography>
          </>
        ) : (
          <Typography>
            This presidency is not controlling this region, you cannot deploy to
            another presidency's region
          </Typography>
        )}
      </>
    );
  }
  if (props.deployType === DeployType.Sovereign) {
    return (
      <>
        {props.isDeployAllowed ? (
          <>
            <Typography>
              This regions strength is {props.targetRegion.towerLevel}
            </Typography>
            <Typography>
              Exhaust troops to add to you dice pool. Subtract{" "}
              {props.targetRegion.towerLevel} dice from your pool and make a
              check.
            </Typography>
          </>
        ) : (
          <Typography>
            Deploying to another presidency's home region is not allowed
          </Typography>
        )}
      </>
    );
  }

  if (props.deployType === DeployType.Dominated) {
    const totalStrength = calculateEmpireStrength(
      props.targetRegion.id,
      props.regions
    );
    return (
      <>
        {props.isDeployAllowed ? (
          <>
            <Typography>This Empire's strength is {totalStrength}</Typography>
            <Typography>
              Exhaust troops to add to you dice pool. Subtract {totalStrength}{" "}
              dice from your pool and make a check.
            </Typography>
          </>
        ) : (
          <Typography>
            Deploying to another presidency's home region is not allowed
          </Typography>
        )}
      </>
    );
  }
  if (props.deployType === DeployType.EmpireCapital) {
    const totalStrength = calculateEmpireStrength(
      props.targetRegion.id,
      props.regions
    );
    return (
      <>
        {props.isDeployAllowed ? (
          <>
            <Typography>This Empire's strength is {totalStrength}</Typography>
            <Typography>
              Exhaust troops to add to you dice pool. Subtract {totalStrength}{" "}
              dice from your pool and make a check.
            </Typography>
          </>
        ) : (
          <Typography>
            Deploying to another presidency's home region is not allowed
          </Typography>
        )}
      </>
    );
  }
};

const DeploySuccessfulResultDialog = (props: {
  targetRegion: Region;
  regions: Region[];
  IsSuccess: boolean;
  deployType: DeployType;
}) => {
  const totalLoot =
    props.targetRegion.towerLevel * 4 +
    (props.targetRegion.lootAvailable ? props.targetRegion.lootAmount : 0);

  switch (props.deployType) {
    case DeployType.CompanyControlledWithUnrest:
      return (
        <>
          <Typography>
            Open all orders and remove unrest in the region
          </Typography>
          <Typography>
            The loot amount is: number of officers used in this action that
            survived + 1. Distribute the loot among those that participated and
            survived in the Deploy action.
          </Typography>
        </>
      );
    case DeployType.CompanyControlledWithoutUnrest:
      return (
        <>
          <Typography>Open all orders in the region</Typography>
          <Typography>
            The loot amount is: number of officers used in this action that
            survived + 1. Distribute the loot among those that participated and
            survived in the Deploy action.
          </Typography>
        </>
      );
    case DeployType.Sovereign:
      return (
        <>
          <Typography>
            Divide loot: the loot amount is {totalLoot}. (Loot minimum, if the
            loot amount is less thant the number of officers that survived + 1,
            increase it by the difference from the bank)
          </Typography>
          {props.targetRegion.towerLevel > 0 && (
            <Typography>
              {props.targetRegion.towerLevel === 1
                ? "Take one trophy"
                : `Take ${props.targetRegion.towerLevel} trophies`}
            </Typography>
          )}
          <Typography>Impose order: Open all orders in the region</Typography>
          <Typography>
            Remove region tower and dome. Replace with the Governor overlay.
            Move control token to associated presidency.
          </Typography>
        </>
      );
    case DeployType.Dominated:
      return (
        <>
          <Typography>Deploy action Successful</Typography>
          <Typography>
            Divide loot: the loot amount is {totalLoot}. (Loot minimum, if the
            loot amount is less thant the number of officers that survived + 1,
            increase it by the difference from the bank)
          </Typography>
          {props.targetRegion.towerLevel > 0 && (
            <Typography>
              Take {props.targetRegion.towerLevel} trophies
            </Typography>
          )}
          <Typography>Impose order: Open all orders in the region</Typography>
          <Typography>
            Remove region tower and dome. Remove {props.targetRegion.dominator}{" "}
            empire flag. Replace with the Governor overlay. Move control token
            to associated presidency.
          </Typography>
          {doesLossOfRegionCauseEmpireShatter(
            props.targetRegion,
            props.regions
          ) && (
            <Typography>
              {props.targetRegion.dominator} Empire shatters: Remove large flag
              from {props.targetRegion.dominator}
            </Typography>
          )}
        </>
      );
    case DeployType.EmpireCapital:
      return (
        <>
          <Typography>Deploy action Successful</Typography>
          <Typography>
            Divide loot: the loot amount is {totalLoot}. (Loot minimum, if the
            loot amount is less thant the number of officers that survived + 1,
            increase it by the difference from the bank)
          </Typography>
          {props.targetRegion.towerLevel > 0 && (
            <Typography>
              Take {props.targetRegion.towerLevel} trophies
            </Typography>
          )}
          <Typography>Impose order: Open all orders in the region</Typography>
          <Typography>
            Remove region tower and dome. Remove capital flag and remove
            empire's small flags from{" "}
            {getEmpireDominatedRegionIds(
              props.targetRegion.id,
              props.regions
            ).join(", ")}{" "}
            . Replace with the Governor overlay. Move control token to
            associated presidency.
          </Typography>
        </>
      );
    default:
      return null;
  }
};
export { DeployType };
