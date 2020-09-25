import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import DateRange from '@material-ui/icons/DateRange';
//import MoreIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  menuButtonRight: {
    marginLeft: theme.spacing(2),
  },
  toolbar: {
    //minHeight: 128,
    alignItems: 'flex-start',
    //paddingTop: theme.spacing(1),
    //paddingBottom: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    alignSelf: 'flex-end',
    textAlign: 'left'
  },
  intervalName: {
    marginTop: 12,
    textAlign: 'left'
  },
}));

export default function HeaderBar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar className={classes.toolbar}>
        <Typography className={classes.title} variant="h5" noWrap>
            bubble space
          </Typography>
        </Toolbar>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
          >
            <ChevronLeft/>
          </IconButton>
          <Typography className={classes.intervalName} variant="h5">
              September
          </Typography>
          <IconButton className={classes.menuButtonRight} aria-label="next interval" color="inherit">
            <ChevronRight/>
          </IconButton>
          <IconButton className={classes.menuButtonRight} aria-label="next interval" edge="end" color="inherit">
            <DateRange/>
          </IconButton>
        </Toolbar>
        
      </AppBar>
    </div>
  );
}
