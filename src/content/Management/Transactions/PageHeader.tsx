import { Typography, Button, Grid } from '@mui/material';

import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import NextLink from 'next/link'

function PageHeader() {
  const user = {
    name: 'Kerala Excise Dept.',
    avatar: '/static/images/avatars/avatar_police.jpg'
  };
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Reports
        </Typography>
        <Typography variant="subtitle2">
          These are your recent reports
          {/* {user.name}, these are your recent reports */}
        </Typography>
      </Grid>
      <Grid item>
        <NextLink href="/management/profile" passHref>
        <Button
          sx={{ mt: { xs: 2, md: 0 } }}
          variant="contained"
          startIcon={<AddTwoToneIcon fontSize="small" />}
        > Submit Report
         
        </Button></NextLink>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
