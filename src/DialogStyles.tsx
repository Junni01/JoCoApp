import { Dialog } from "@mui/material";
export const EventDialog = (props: { children: React.ReactNode }) => {
  return (
    <Dialog open={true} hideBackdrop>
      {props.children}
    </Dialog>
  );
};
