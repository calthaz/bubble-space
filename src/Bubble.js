import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import BubbleDialog from './BubbleDialog';

const styles = theme => ({
  root: {
    margin:'5px',
    display:'inline-block',
    position: 'absolute',
  },
  btn: {
  	width: '50px',
    height: '50px',//todo calc(...)
		minWidth: 'initial',
   // background: 'linear-gradient(60deg, rgba(242, 255, 38, 0.5), rgba(224, 251, 0, 0.5)), '+
                //'linear-gradient(60deg, rgba(38, 195, 255, 0.5), rgba(0, 205, 251, 0.5))',
    backgroundBlendMode: 'multiply',
    borderRadius: '50%',
    
    //top: '0px',
    boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.12)',
  }
});

class Bubble extends React.Component {

  state = {
    formOpen: false,
    tempBubble:this.props.bubble,//??? copy this?
  };

  handleFormOpen = () => {
    this.setState({ formOpen: true });
  };

  handleFormClose = (value) => {
    this.setState({ formOpen: false });
  };

  handleFormChange = name => event => {
    this.setState({
      ...this.state, //optional?
      tempBubble: {
      	...this.state.tempBubble,
      	[name]: event.target.value,
      }
    });
  };

  handleFormCoordChange = index => event => {
  	const coord = this.state.tempBubble.coord.slice();
  	const val = event.target.value; //number or empty string
  	//console.log(val);
  	if(val===''|| (val>=-5 && val<=5)){
			coord[index] = val===''? '' : Math.floor(val);
	  	this.setState({
	      tempBubble: {
	      	...this.state.tempBubble,
	      	coord: coord,
	      }
	    });
  	}
  	
  }

  constructBackground = () => {
  	let pleasure = this.state.tempBubble.coord[0]/5;
  	let arousal = this.state.tempBubble.coord[1]/5;
  	let bg = `linear-gradient(60deg, rgba(242, 255, 38, ${Math.max(0, pleasure)}), `
  	         +`rgba(224, 251, 0, ${Math.max(0, pleasure)})), `
             +`linear-gradient(240deg, rgba(38, 115, 255, ${Math.max(0, -pleasure)}), `
             +`rgba(0, 100, 251, ${Math.max(0, -pleasure)})), `
             +`linear-gradient(150deg, rgba(255, 38, 38, ${Math.max(0, arousal)}), `
  	         +`rgba(251, 0, 0, ${Math.max(0, arousal)})), `
             +`linear-gradient(330deg, rgba(51, 255, 38, ${Math.max(0, -arousal)}), `
             +`rgba(39, 251, 0, ${Math.max(0, -arousal)})) `;
    return bg; 
  };

//flag: enforced stupid duplicate in App.js
  calculateRadius = () => {
  	const { bubble } = this.props;
  	 //var SIZES = [0,1,2,3,4,5,6];
  	let r = (Math.abs(bubble.coord[0])+Math.abs(bubble.coord[1]));
    return r===0 ? 0 : (Math.floor((r-1)/2)); 
    //return 3; //some category 
  };

  render(){
  	const { classes, grds, bubble, radiusOffset } = this.props;
  	//console.log(radiusOffset);
  	let r = Math.floor((this.calculateRadius()+radiusOffset)*grds+grds/2);
  	return (
  		<div className={classes.root} style={{top: (bubble.pos[1]*grds)-r,
      	left: (bubble.pos[0]*grds)-r,
      }}>
      <Button onClick={this.handleFormOpen} className={classes.btn} style={{
      	background:this.constructBackground(),
      	width:(r) +'px',
      	height:(r) +'px',
      	//top: bubble.pos[1]*grds,
      	//left: bubble.pos[0]*grds,
      }}>
        {''}
	    </Button>
	    {//To clarify: if you initially pass undefined or null as the value prop, the component starts life as an "uncontrolled" component. 
	    //Once you interact with the component, we set a value and react changes it to a "controlled" component, and issues the warning.
	    }
	    <BubbleDialog 
		    formOpen = {this.state.formOpen}
		    handleFormClose = {this.handleFormClose}
		    handleFormChange = {this.handleFormChange}
		    handleFormCoordChange= {this.handleFormCoordChange}
	      title = {'View/Edit Bubble'}
	      bubble = {this.state.tempBubble}
	    />
	    </div>
    );
  }
}

Bubble.propTypes = {
  classes: PropTypes.object.isRequired, //to support withStyles
};

export default withStyles(styles)(Bubble);	