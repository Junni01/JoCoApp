import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
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
import {
  calculateEmpireStrength,
  doesLossOfRegionCauseEmpireShatter,
  isValidDeployRegion,
} from "../Helpers";
import { useContext, useState } from "react";
import { DeployResult } from "./DeployResult";
import { GlobalEffectsContext } from "../GlobalEffectsContext";

type DeployDialogProps = {
  targetRegion: Region | undefined;
  onConfirm: () => void;
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

  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, setRegions, elephant, setElephant } = globalEffectsContext;

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
      return isValidDeployRegion(deployingPresidency, targetRegion, regions);
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
        return calculateEmpireStrength(targetRegion.id, regions);
      case RegionStatus.EmpireCapital:
        return calculateEmpireStrength(targetRegion.id, regions);
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
          Note: This is a company controlled region that has no unrest, you can
          deploy if it has closed orders that you can open. Otherwise deploying
          to this region is not allowed.
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
            {deployingPresidency} is not allowed to deploy into this region:
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
            {deployingPresidency} is not allowed to deploy into this region:
            Deploying to another presidency's home region is not allowed.
          </Typography>
        );
      }

      if (!props.targetRegion) {
        console.error("DeployDialog: Target region is undefined");
        return "";
      }

      if (
        !isValidDeployRegion(deployingPresidency, props.targetRegion, regions)
      ) {
        return (
          <Typography>
            {deployingPresidency} is not allowed to deploy into this region: You
            cannot deploy to a region that is not adjacent to a region that is
            controlled by your presidency or is not your home region.
          </Typography>
        );
      }
    }
  };

  const handleSuccessfulDeployToCompanyControlledRegion = () => {
    const newRegionArray = regions.filter((r) => r.id !== targetRegion.id);
    targetRegion.unrest = 0;
    setRegions([...newRegionArray, targetRegion]);
  };

  const handleSuccessfulDeployToDominatedRegion = () => {
    const dominator = regions.find((r) => r.id === targetRegion.dominator);

    if (!dominator) {
      console.error(
        "handleSuccessfulDeployToDominatedRegion: Dominator is undefined!"
      );
      return;
    }

    if (doesLossOfRegionCauseEmpireShatter(targetRegion, regions)) {
      dominator.status = RegionStatus.Sovereign;
    }

    const newRegionArray = regions.filter(
      (r) => r.id !== targetRegion.id && r.id !== dominator?.id
    );
    targetRegion.unrest = 0;
    targetRegion.lootAvailable = false;
    targetRegion.status = RegionStatus.CompanyControlled;
    targetRegion.towerLevel = 0;
    targetRegion.dominator = undefined;
    targetRegion.controllingPresidency = deployingPresidency;

    setRegions([...newRegionArray, targetRegion, dominator]);
  };

  const handleSuccessfulDeployToSovereignRegion = () => {
    const newRegionArray = regions.filter((r) => r.id !== targetRegion.id);
    targetRegion.unrest = 0;
    targetRegion.lootAvailable = false;
    targetRegion.status = RegionStatus.CompanyControlled;
    targetRegion.towerLevel = 0;
    targetRegion.controllingPresidency = deployingPresidency;
    setRegions([...newRegionArray, targetRegion]);
  };

  const handleSuccessfulDeployToCapitalRegion = () => {
    const dominatedRegions = regions.filter(
      (r) => r.dominator === targetRegion.id
    );

    targetRegion.unrest = 0;
    targetRegion.lootAvailable = false;
    targetRegion.status = RegionStatus.CompanyControlled;
    targetRegion.towerLevel = 0;
    targetRegion.dominator = undefined;
    targetRegion.controllingPresidency = deployingPresidency;
    const newRegionArray = regions.filter(
      (r) => r.id !== targetRegion.id && !dominatedRegions.includes(r)
    );

    const modifiedDominatedRegions: Region[] = [];

    for (const region of dominatedRegions) {
      region.dominator = undefined;
      region.status = RegionStatus.Sovereign;
      modifiedDominatedRegions.push(region);
    }

    setRegions([...newRegionArray, ...modifiedDominatedRegions, targetRegion]);
  };

  const handleSuccessfulDeploy = () => {
    setDeployPage(DeployPage.Results);
    setDeploySuccess(true);
  };

  const handleFailedDeploy = () => {
    setDeployPage(DeployPage.Results);
    setDeploySuccess(false);
  };

  const deployRedirectElephant = () => {
    if (
      elephant.MainRegion === targetRegion.id &&
      elephant.TargetRegion !== undefined
    ) {
      setElephant({ MainRegion: targetRegion.id, TargetRegion: undefined });
    }
  };

  const handleConfirmResults = () => {
    if (deploySuccess) {
      switch (deployType) {
        case DeployType.CompanyControlledWithoutUnrest:
          handleSuccessfulDeployToCompanyControlledRegion();
          break;
        case DeployType.CompanyControlledWithUnrest:
          handleSuccessfulDeployToCompanyControlledRegion();
          break;
        case DeployType.Dominated:
          handleSuccessfulDeployToDominatedRegion();
          break;
        case DeployType.Sovereign:
          handleSuccessfulDeployToSovereignRegion();
          break;
        case DeployType.EmpireCapital:
          handleSuccessfulDeployToCapitalRegion();
          break;
      }
      deployRedirectElephant();
    }
    props.onConfirm();
  };

  const renderDeployPage = () => {
    switch (deployPage) {
      case DeployPage.SelectPresidency:
        return (
          <>
            <DialogContent sx={{ minHeight: "300px" }}>
              <Typography gutterBottom>Select Deploying Presidency:</Typography>
              <Box display={"flex"} justifyContent={"space-around"}>
                <ArmyButton
                  presidency={Presidency.BengalPresidency}
                  selectedPresidency={deployingPresidency}
                  setSelectedPresidency={setDeployingResidency}
                />

                <ArmyButton
                  presidency={Presidency.BombayPresidency}
                  selectedPresidency={deployingPresidency}
                  setSelectedPresidency={setDeployingResidency}
                />
                <ArmyButton
                  presidency={Presidency.MadrasPresidency}
                  selectedPresidency={deployingPresidency}
                  setSelectedPresidency={setDeployingResidency}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <DeployMessage />
              </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-around" }}>
              <Button variant="outlined" onClick={props.onConfirm}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!isDeployAllowed()}
                onClick={() => setDeployPage(DeployPage.Deploy)}
              >
                Deploy
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
                deployingPresidency={deployingPresidency}
                targetRegion={targetRegion}
                deploySuccessful={deploySuccess}
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

const ArmyButton = (props: {
  presidency: Presidency;
  selectedPresidency: Presidency;
  setSelectedPresidency: (presidency: Presidency) => void;
}) => {
  const selected = props.presidency === props.selectedPresidency;

  return (
    <Card
      elevation={selected ? 2 : 0}
      sx={{
        width: "200px",
        background: selected ? "lightgrey" : "white",
        borderRadius: "10px",
        border: selected ? "4px solid black" : "1px solid black",
      }}
    >
      <CardActionArea
        onClick={() => props.setSelectedPresidency(props.presidency)}
      >
        <CardContent sx={{ alignContent: "center", justifyContent: "center" }}>
          <Typography textAlign={"center"} variant="h6">
            {props.presidency}
          </Typography>
          <Typography textAlign={"center"} variant="h6">
            Army
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const DeployDialogContent = (props: {
  deployType: DeployType;
  presidency: Presidency;
  defenseStrength: number;
}) => {
  return (
    <DialogContent sx={{ minHeight: "300px" }}>
      <List>
        <ListItem>
          <Typography>
            <b>Region Strength:</b> {props.defenseStrength}
          </Typography>
        </ListItem>

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
    </DialogContent>
  );
};

export { DeployType };
