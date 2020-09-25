import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';

const styles = theme => ({
  root: {
    margin:'5px',
    position: 'absolute',
  },
  row:{
      display: 'flex',
      flexDirection: 'row'
  },

  btn: {
  	width: '90px',
    height: '50px',//todo calc(...)
	minWidth: 'initial',
   // background: 'linear-gradient(60deg, rgba(242, 255, 38, 0.5), rgba(224, 251, 0, 0.5)), '+
                //'linear-gradient(60deg, rgba(38, 195, 255, 0.5), rgba(0, 205, 251, 0.5))',
    backgroundBlendMode: 'multiply',
    //borderRadius: '50%',
    
    //top: '0px',
    boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.12)',
  }
});

class BubbleMap extends React.Component {


  constructBackground = (p, a) => {
  	let pleasure = p/5;
  	let arousal = a/5;
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
  calculateRadius = (p, a) => {
  	 //var SIZES = [0,1,2,3,4,5,6];
  	let r = (Math.abs(p)+Math.abs(a));
    return r===0 ? 0 : (Math.floor((r-1)/2)); 
    //return 3; //some category 
  };

  render(){
    const { classes } = this.props;
      //console.log(radiusOffset);
    
    let bubbleDivs=[]
    for (let a = 5; a>=-5; a--){
        let bubbles = []
        for (let p = -5; p<=5; p++){
            bubbles.push(<div className={classes.btn} 
            style={{
               background:this.constructBackground(p, a),
               //width:(r*2.5) +'px',
               //height:(r*2.5) +'px',
               //top: bubble.pos[1]*grds,
               //left: bubble.pos[0]*grds,
               }}
           >
           {this.calculateRadius(p, a)}, {p}, {a}
           </div>);
        }
    bubbleDivs.push(<div className={classes.row}>{bubbles}</div>)
    }

    return (
        <div className={classes.root}>
          {bubbleDivs}
        </div>
      );
  }
}

BubbleMap.propTypes = {
  classes: PropTypes.object.isRequired, //to support withStyles
};

export default withStyles(styles)(BubbleMap);	