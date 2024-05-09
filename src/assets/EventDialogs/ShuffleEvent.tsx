import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export const ShuffleEvent = (props: { onOk: () => void }) => {
  return (
    <Dialog
      open={true}
      PaperProps={{ sx: { ml: "1000px" } }}
      hideBackdrop
      draggable
    >
      <DialogTitle>Event: Shuffle</DialogTitle>
      <DialogContent>
        <Typography>
          Shuffle event is shuffled into the draw stack and discard pile is
          shuffled and put on top of the draw stack
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onOk()}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};
