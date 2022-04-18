import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

// Props
interface SelectorProps {
  id: string,
  label?: string,
  selected: string | null,
  options: string[],
  formKey: string,
  dispatch: (action : any) => void
};

// Generic Selector component
export default function Selector (props : SelectorProps) {
  return (
    <Autocomplete
      id={props.id}
      options={props.options}
      value={props.selected}
      onChange={(_: any, value: string | null) => {
        if (typeof value === 'string') {
          props.dispatch({ type: 'update', key: props.formKey, value: value });
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label={(props.label) ? props.label : ''} variant="standard" />
      )}
    />
  );
};
