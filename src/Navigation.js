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

  handleAddFormClose = (value) => {
  	//update depth exceeded?
  	//console.log(value); //1000 undefined Navigation.js:66 
  	//Maximum update depth exceeded. This can happen 
  	//when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. 
  	//React limits the number of nested updates to prevent infinite loops.
  	if(value=="cancel"){
  		
  	}else if(value=="add"){
  		//check required fields
  		this.props.addBubble(this.state.newBubble);
  		this.setState({ newBubble: emptyFormBubble });
  	}
    this.setState({ addFormOpen: false });
  };

  handleNavButtomChange = (event, value) => {
    this.setState({ navValue: value });
  };

  //https://stackoverflow.com/questions/34072009/update-nested-object-with-es6-computed-property-name
  //why not be a bit radical just this time
  handleAddFormChange = name => event => {
    this.setState({
      ...this.state, //optional?
      newBubble: {
      	...this.state.newBubble,
      	[name]: event.target.value,
      }
    });
  };

  handleAddFormCoordChange = index => event => {
  	const coord = this.state.newBubble.coord.slice();
  	const val = event.target.value; //number or empty string
  	//console.log(val);
  	if(val===''|| (val>=-5 && val<=5)){
			coord[index] = val===''? '' : Math.floor(val);
	  	this.setState({
	      newBubble: {
	      	...this.state.newBubble,
	      	coord: coord,
	      }
	    });
  	}
  	
  }

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
        		handleFormChange = {this.handleAddFormChange}
        		handleFormCoordChange= {this.handleAddFormCoordChange}
            title = {'Blow your mood bubble'}
            bubble = {newBubble}
        	/>
        <BottomNavigationAction disableRipple  label="View" value="favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction disableRipple  label="Nearby" value="nearby" icon={<LocationOnIcon />} />
        <BottomNavigationAction disableRipple onClick={this.props.saveList} label="Save" value="save" icon={<FolderIcon />} />    

      </BottomNavigation>
    );
  }
}

Navigation.propTypes = {
  classes: PropTypes.object.isRequired, //to support withStyles
};

export default withStyles(styles)(Navigation);