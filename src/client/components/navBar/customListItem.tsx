import React from "react";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

export default function CustomListItem({
  children,
  text,
  onClick,
}: {
  children: React.ReactNode,
  text: string,
  onClick?: () => void
}) {
  return (
    <ListItem>
      <ListItemButton onClick={onClick}>
        <ListItemIcon>
          {children}
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  );
}
