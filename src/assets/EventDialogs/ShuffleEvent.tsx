import { DialogContent, DialogTitle, Typography } from "@mui/material";

export const ShuffleEvent = () => {
  return (
    <>
      <DialogTitle>Event: Shuffle</DialogTitle>
      <DialogContent>
        <Typography>
          Shuffle event is shuffled into the draw stack and discard pile is
          shuffled and put on top of the draw stack
        </Typography>
      </DialogContent>
    </>
  );
};
