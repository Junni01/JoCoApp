import {
  DialogContent,
  Typography,
  DialogActions,
  Button,
  ListItem,
  List,
} from "@mui/material";
import { useState } from "react";
import { Region } from "../Types";
import { AttackAgainstCompanyResult } from "../AttackAgainstCompanyResult";

export const RebellionInCompanyControlled = (props: {
  rebellionStrength: number;
  setRebellionOutcome: (rebellionSuppressed: boolean) => void;
  rebellingRegion: Region;
}) => {
  const [rebellionsSuppressed, setRebellionSuppressed] =
    useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleRebellionResult = (rebellionSuppressed: boolean) => {
    setRebellionSuppressed(rebellionSuppressed);
    setShowResults(true);
  };

  const handleRebellionResultConfirm = () => {
    setShowResults(false);
    props.setRebellionOutcome(rebellionsSuppressed);
  };

  if (!showResults) {
    return (
      <>
        <DialogContent>
          <Typography>
            Rebellion in {props.rebellingRegion.id} against the company.
          </Typography>
          <List>
            <ListItem>
              The rebellion strength is {props.rebellionStrength}
            </ListItem>
            <ListItem>
              The controlling presidency is{" "}
              {props.rebellingRegion.controllingPresidency}.
            </ListItem>
            <ListItem>
              Commander of {props.rebellingRegion.controllingPresidency} Army
              must exhaust pieces in the Army equal to the rebellion strength or
              as many as possible. If the newly-exhausted pieces do not equal
              the rebellion strength the rebellion succeeds.
            </ListItem>
            <ListItem></ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleRebellionResult(true)}>
            Rebellion Suppressed
          </Button>
          <Button onClick={() => handleRebellionResult(false)}>
            Rebellion Successful
          </Button>
        </DialogActions>
      </>
    );
  } else {
    return (
      <>
        <DialogContent>
          <AttackAgainstCompanyResult
            regionName={props.rebellingRegion.id}
            attackSuccessful={!rebellionsSuppressed}
            controllingPresidency={props.rebellingRegion?.controllingPresidency}
            isInvasion={false}
            invadingRegion={undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRebellionResultConfirm}>Confirm</Button>
        </DialogActions>
      </>
    );
  }
};
