import {
  DialogContent,
  Typography,
  DialogActions,
  Button,
} from "@mui/material";
import { useState } from "react";
import { Region } from "../../Types";

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
    props.setRebellionOutcome(rebellionsSuppressed);
  };

  if (showResults) {
    return (
      <>
        <DialogContent>
          <Typography>
            Rebellion in {props.rebellingRegion.id} against the company. The
            rebellion strength is {props.rebellionStrength}
            Exhaust troops in {props.rebellingRegion.controllingPresidency} army
            to suppress the rebellion.
          </Typography>
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
          {rebellionsSuppressed ? (
            <>
              <Typography>
                {props.rebellingRegion.controllingPresidency} army successfully
                manages to suppress the rebellion.
              </Typography>
              <Typography>
                Commander of {props.rebellingRegion.controllingPresidency} army
                receives 1 trophy. Remove all unrest from the region.
              </Typography>
            </>
          ) : (
            <>
              <Typography>
                Rebellion in {props.rebellingRegion.id} is successful.
              </Typography>
              <Typography>
                Tarnish the commander's name: Commander of the{" "}
                {props.rebellingRegion.controllingPresidency} army returns half
                (rounding up) of the trophies their family own to the supply.
                Return the Commander to its supply. Officer Rout. Roll a die for
                every officer in the{" "}
                {props.rebellingRegion.controllingPresidency} and remove it if
                the roll is a 6. Eliminate governor: if the region has a
                governor remove It Restore Local Authority: Remove company ship,
                any unrest in the region and place a dome back in the region
                with one tower level. Close every open order in the region, If
                all are already closed, resolve a Cascade. Lower the company's
                standing by one to the left for each region lost this turn
                (including this region)
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRebellionResultConfirm}>Ok</Button>
        </DialogActions>
      </>
    );
  }
};
