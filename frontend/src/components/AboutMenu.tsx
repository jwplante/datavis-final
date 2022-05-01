import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React from 'react';

// Function based on the corresponding function for A3
export default function AboutMenu (props: {open: boolean, closeMenu:() => void}) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeMenu}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
          About this app
      </DialogTitle>
      <DialogContent dividers>
          <DialogContentText id="alert-dialog-description">
            This app was written by James Plante and Alicia Howell-Munson, 2022
            More information about this app can be found here: <a href='https://google.com'>Link to Video demo</a>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.closeMenu} autoFocus>
            Close
          </Button>
        </DialogActions>
    </Dialog>
  );
};
