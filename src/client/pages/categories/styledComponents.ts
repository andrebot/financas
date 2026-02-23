import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import type { StyleCompProp } from '../../types';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export const CategoriesMain = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px'
}));

export const CategoryList = styled('div')(() => ({
  display: 'flex',
  width: '100%',
  flexWrap: 'wrap',
  gap: '10px',
  justifyContent: 'center'
}));

export const CategoryTitleHolder = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: '10px',
  alignItems: 'center',
  width: '100%',
}));

export const AddCategoryButton = styled(Tooltip)(() => ({
  alignSelf: 'center',
}));

export const ParentCategory = styled(Paper)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '10px',
  width: '100%',
  maxWidth: '500px',
}));

export const SubCategoryHolder = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
  alignItems: 'center',
  width: '100%',
  border: `1px solid ${theme.palette.grey.A400}`,
  borderRadius: '5px',
  padding: '10px',
}));

export const SubCategoryTextField = styled(TextField)(() => ({
  flexGrow: '1',
}));

export const SubCategoryList = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
  alignItems: 'center',
  width: '100%',
  flexWrap: 'wrap',
  flexGrow: '1',
}));

export const CreateCategoryModal = styled(Paper)(({ theme }) => ({
  padding: '20px',
  gap: '10px',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    width: '400px',
  },
}));

export const SubCategoryWrapper = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  gap: '20px',
  padding: '15px 10px 10px 10px',
  border: `1px solid ${theme.palette.grey.A400}`,
  borderRadius: '5px',
}));

export const SubCategoryTitle = styled(Typography)(({ theme }: StyleCompProp) => ({
  position: 'absolute',
  top: '-13px',
  left: '10px',
  padding: '0 5px',
  backgroundColor: theme.palette.background.default,
  backgroundImage: 'var(--Paper-overlay)',
}));
