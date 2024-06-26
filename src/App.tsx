import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { IndiaMap } from "./IndiaMap";
import { Scenario } from "./Types";
import { useContext, useState } from "react";
import {
  Leaders,
  getElephantInitialPosition,
  getInitialEventDeck,
  getRegionData,
} from "./Data";
import { shuffleEventPile, shuffleLeaders } from "./Helpers";
import { GlobalEffectsContext } from "./GlobalEffectsContext";

function App() {
  const [SetupDialogOpen, setSetupDialogOpen] = useState(true);

  const [scenario, setScenario] = useState<Scenario>(Scenario.SeventeenTen);

  const availableLeaders = shuffleLeaders(Leaders);

  const globalEffects = useContext(GlobalEffectsContext);

  const handleSetScenario = (scenario: Scenario) => {
    setScenario(scenario);
  };

  const handleStartGame = () => {
    const initialEventDeck = getInitialEventDeck();
    const shuffledEventDeck = shuffleEventPile(initialEventDeck);

    globalEffects.setEventDeck(shuffledEventDeck);
    globalEffects.setElephant(getElephantInitialPosition(scenario));
    globalEffects.setRegions(getRegionData(scenario));

    const regions = getRegionData(scenario);

    for (let i = 0; i < regions.length; i++) {
      const leader = availableLeaders.pop();
      regions[i].leader = leader;
    }

    globalEffects.setAvailableLeaders(availableLeaders);

    globalEffects.setRegions(getRegionData(scenario));
    setSetupDialogOpen(false);
  };

  return (
    <>
      {!SetupDialogOpen && <IndiaMap />}
      {SetupDialogOpen && (
        <Dialog open={true}>
          <DialogContent>
            <FormControl>
              <FormLabel>Select Scenario: </FormLabel>
              <RadioGroup
                onChange={(e) => {
                  handleSetScenario(e.target.value as Scenario);
                }}
                value={scenario}
              >
                <FormControlLabel
                  value={Scenario.SeventeenTen}
                  control={<Radio />}
                  label={"1710"}
                />
                <FormControlLabel
                  value={Scenario.SeventeenFiftyEight}
                  control={<Radio />}
                  label={"1758"}
                />
                <FormControlLabel
                  value={Scenario.EighteenThirteen}
                  control={<Radio />}
                  label={"1813"}
                />
              </RadioGroup>
            </FormControl>
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => {
                  handleStartGame();
                }}
              >
                Start Game
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default App;
