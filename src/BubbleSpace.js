import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Bubble from './Bubble';

const styles = {
  root: {
    //width: '100%',
    //height: '890px',//todo calc(...)
    backgroundColor: '#eeeeee',
    //position: 'fixed',
    top: '0px',
    textAlign: 'initial',
  },
};

class BubbleSpace extends React.Component {
  constructor(props) {
    super(props);
    const {bubbles} = this.props;
    //const activeBubbles = [];
    /*
    for (let i = 0; i < bubbles.length; i++) {
      if(bubbles[i].active){
        bubbles[i].pos = null;
        activeBubbles.push(bubbles[i]);
      }
    }
    const activeBubbles = bubbles.filter(bubble => bubble.active);
    this.state = {
      bubbles:activeBubbles, //what about subsequent updates? well, there is no way to know that...
    };*/
  }
  
  render() {
    const { classes, bubbles, radiusOffset } = this.props;
    const spw = this.props.spaceWidth;
    const sph = this.props.spaceHeight;
    const grds = this.props.gridSize;
    const bubbleDivs = bubbles.filter(bubble => (bubble.active && bubble.pos)).map((bubble, index) => {
      //if(bubble.active){
        return ( //should map to bubble elements.
          <Bubble 
          key={bubble.id} 
          bubble={bubble} 
          grds = {grds}
          radiusOffset = {radiusOffset}
          focusBubble = {this.props.focusBubble}
          /> 
        );
      /*}else{
        return null; //???
      }*/  
    });
    return (
      <div className={classes.root} style={{width:spw*grds, height: sph*grds}}>
        {bubbleDivs}
      </div>
    );
  }
}

BubbleSpace.propTypes = {
  classes: PropTypes.object.isRequired, //to support withStyles
};

export default withStyles(styles)(BubbleSpace);
/*
<header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>*/