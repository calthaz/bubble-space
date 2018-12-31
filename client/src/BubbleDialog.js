import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  withMobileDialog,
} from 'material-ui/Dialog';
const moodPlaneParser = require('./moodPlaneParser');

const styles = theme =>({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
  numField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  multilineField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
});

class BubbleDialog extends React.Component {
	constructor(props) {
    	super(props);
    	this.state = {
    		buffer: this.props.bubble,
    	}
    }

//https://stackoverflow.com/questions/34072009/update-nested-object-with-es6-computed-property-name
  //why not be a bit radical just this time
    handleFormChange = name => event => {
    	this.setState({
		    buffer: {
		      ...this.state.buffer,
		      [name]: event.target.value,
		    }
    	});
  	};

  	handleFormCoordChange = index => event => {
    	const coord = this.state.buffer.coord.slice();
    	const val = event.target.value; //number or empty string
	    //console.log(val);
	    if(val===''|| (val>=-5 && val<=5)){
	      	coord[index] = val===''? '' : Math.floor(val);
	      	this.setState({
	       		buffer: {
	          	...this.state.buffer,
	          	coord: coord,
	        	}
	      	});
	    }
    
  	}

  	handleFormClose = (value) => {
	  	//update depth exceeded?
	  	//console.log(value); //1000 undefined Navigation.js:66 
	  	//Maximum update depth exceeded. This can happen 
	  	//when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. 
	  	//React limits the number of nested updates to prevent infinite loops.
	  	if(value==="cancel"){
	  		//msg: cancelled
	  		this.setState({ buffer: this.props.bubble });
	  	}else if(value===this.props.actionName){
	  		//check required fields
	  		this.props.action(this.state.buffer);	  		
	  	}else if(value===this.props.actionName2){
	  		//check required fields
	  		console.log("trying to delete: "+this.state.buffer.id)
	  		this.props.action2(this.state.buffer.id);	  		
	  	}
	    this.props.handleFormClose();
  	};


	render() {
      const { fullScreen } = this.props;
      const { classes } = this.props; //bubble 
      const { formOpen } = this.props;//, handleFormClose, handleFormChange, handleFormCoordChange
      const { title, actionName, actionName2 } = this.props;
      let bubble = this.state.buffer;
      let defaultDialogueActions = 
      		(<DialogActions>
      			<Button onClick={
            	//https://stackoverflow.com/questions/48497358/reactjs-maximum-update-depth-exceeded-error/48497410
              //that because you calling toggle inside the render method which will cause to re-render 
              //and toggle will call again and re-rendering again and so on
              //not onChange?
            	()=>this.handleFormClose('cancel')
            } color="primary">
              Cancel
            </Button>
            {(actionName2!==undefined && actionName2 !== "") &&             
            <Button onClick={() => this.handleFormClose(actionName2)} color="secondary" autoFocus>
              {actionName2}
            </Button>}
            <Button onClick={() => this.handleFormClose(actionName)} color="primary" autoFocus>
              {actionName}
            </Button>
            </DialogActions>);
        return (
      	<Dialog
          fullScreen={fullScreen}
          open={formOpen}
          onClose={this.handleFormClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {(bubble.title||"Untitled")}, [{moodPlaneParser[bubble.coord[0]+5][bubble.coord[1]+5]}]<br/>
              {bubble.situation}
            </DialogContentText>
            <TextField
		          id="title"
		          label="Title"
		          className={classes.textField}
		          value={bubble.title}
		          onChange={//can't use ()=>... here
		          	this.handleFormChange('title')}
		          margin="normal"
		        />
		        <TextField
		          id="date"
		          label="Date"
		          type="date"
		          className={classes.textField}
		          value={bubble.date}
		          onChange={this.handleFormChange('date')}
		          margin="normal"
		          InputLabelProps={{
          			shrink: true,
        		  }}
		        />
		        <TextField
		          id="coord_0"
		          label="Pleasure"
		          value={bubble.coord[0]}
		          onChange={this.handleFormCoordChange(0)}
		          type="number"
		          className={classes.textField}
		          InputLabelProps={{
		            shrink: true,
		          }}
		          margin="normal"
		        />
		        <TextField
		          id="coord_1"
		          label="Arousal"
		          value={bubble.coord[1]}
		          onChange={this.handleFormCoordChange(1)}
		          type="number"
		          className={classes.textField}
		          InputLabelProps={{
		            shrink: true,
		          }}
		          margin="normal"
		        />
		        <TextField
		          id="situation"
		          label="Situation"
		          multiline
		          value={bubble.situation}
		          onChange={this.handleFormChange('situation')}
		          className={classes.multilineField}
		          margin="normal"
		        />
		        <TextField
		          id="thoughts"
		          label="Thoughts"
		          multiline
		          value={bubble.thoughts}
		          onChange={this.handleFormChange('thoughts')}
		          className={classes.multilineField}
		          margin="normal"
		        />
		        <TextField
		          id="feelings"
		          label="Feelings"
		          multiline
		          value={bubble.feelings}
		          onChange={this.handleFormChange('feelings')}
		          className={classes.multilineField}
		          margin="normal"
		        />
          </DialogContent>
          
          {defaultDialogueActions}

        </Dialog>
      );
    }  
}

BubbleDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, //to support withStyles
};
//https://stackoverflow.com/questions/45704681/react-material-ui-export-multiple-higher-order-components
BubbleDialog = withStyles(styles)(BubbleDialog);
export default withMobileDialog({breakpoint: '500px'})(BubbleDialog);