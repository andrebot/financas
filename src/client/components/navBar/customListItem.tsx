import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

/**
 * This component is a list item for the nav bar.
 *
 * @param children - The children to display
 * @param text - The text to display
 * @param onClick - The function to call when the component is clicked
 * @returns The custom list item component
 */
export default function CustomListItem({
  children,
  text,
  onClick = () => {},
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
