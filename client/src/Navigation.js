import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import BottomNavigation, { BottomNavigationAction } from 'material-ui/BottomNavigation';
import AddIcon from '@material-ui/icons/Add';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FolderIcon from '@material-ui/icons/Folder';
import BubbleDialog from './BubbleDialog';

const styles = {
  root: {
    width: '100%',
    position: 'fixed',
    bottom: '0px',
    "@media (max-width:500px)": {
      top:'0px',
      bottom:'initial',
      zIndex: 100
    }
  },
  textField: {
    //marginLeft: theme.spacing.unit,
   // marginRight: theme.spacing.unit,
    width: 400,
  },
  numField: {
    //marginLeft: theme.spacing.unit,
   // marginRight: theme.spacing.unit,
    width: 200,
  },
  multilineField: {
    //marginLeft: theme.spacing.unit,
   // marginRight: theme.spacing.unit,
    width: 400,
  },
};

var emptyFormBubble = {
    	coord:[0,0], 
      title: '',
      date: '',
      situation: '',
      thoughts: '',
      feelings: '',
      tags: [],
    };

class Navigation extends React.Component {
  state = {
    addFormOpen: false,
    listOpen: false,
    navValue: '',
    newBubble:{
    	coord:[0,0], 
      title: '',
      date: '',
      situation: '',
      thoughts: '',
      feelings: '',
      tags: [],
    },
  };

  handleAddFormOpen = () => {
    this.setState({ addFormOpen: true });
  };
 //copied
  handleAddFormClose = (value) => {
    this.setState({ addFormOpen: false });
  };

  handleNavButtomChange = (event, value) => {
    this.setState({ navValue: value });
  };

  render() {
    const { classes } = this.props;
    const { navValue } = this.state;
    const { newBubble } = this.state;

    return (
    	//this spread doesn't work?https://material-ui-next.com/guides/api/#spread
      <BottomNavigation disableRipple value={navValue} onChange={this.handleNavButtomChange} className={classes.root}>
        <BottomNavigationAction disableRipple onClick={this.handleAddFormOpen} label="Add" value="add" icon={<AddIcon />} />
        	<BubbleDialog 
        		formOpen = {this.state.addFormOpen}
        		handleFormClose = {this.handleAddFormClose}
        		action = {(bubble)=>this.props.addBubble(bubble)}
        		//handleFormCoordChange= {this.handleAddFormCoordChange}
            title = {'Blow your mood bubble'}
            actionName = {'add'}
            bubble = {newBubble}
        	/>
        <BottomNavigationAction disableRipple  label="View" value="favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction disableRipple onClick={this.props.sortListByTime} label="Timeline" value="nearby" icon={<LocationOnIcon />} />
        <BottomNavigationAction disableRipple onClick={this.props.saveList} label="Save" value="save" icon={<FolderIcon />} />    

      </BottomNavigation>
    );
  }
}

Navigation.propTypes = {
  classes: PropTypes.object.isRequired, //to support withStyles
};

export default withStyles(styles)(Navigation);