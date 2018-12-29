import React, { Component } from 'react';
import PropTypes from 'prop-types';
import List, { ListItem, ListItemText } from 'material-ui/List';
import { withStyles } from 'material-ui/styles';
import BubbleDialog from './BubbleDialog';

const styles = {
  root: {
    top: '0px',
    right: '0px',
    textAlign: 'initial',
    position: 'fixed',
    overflowY: 'auto',
    height: 'calc(100% - 65px)',
    width: '300px',
    backgroundColor: 'rgba(230,230,200, 0.7)',
    "@media (max-width:500px)": {
      position: 'relative',
      width:"100%",
      top: "56px"
    }
  },
};

class BubbleList extends React.Component {
  constructor(props) {
    super(props);
    //const {bubbles} = this.props;
    this.state = {
      formOpen: -1,
    }
  }

  handleFormOpen = (id) => {
    console.log('form open: '+id);
    this.setState({ formOpen: id });
  };

  handleFormClose = (value) => {
    this.setState({ formOpen: -1 });
  };
  
  render() {
    const { classes, bubbles, radiusOffset } = this.props;
    const bubbleDivs = bubbles.map((bubble, index) => {
        return ( //should map to bubble elements.
        <ListItem key={bubble.id} button>
          <ListItemText primary={':'+bubble.title} 
          secondary={bubble.date+' ['+bubble.coord[0]+', '+bubble.coord[1]+']'} onClick={()=>this.handleFormOpen(bubble.id)}/>
          {//To clarify: if you initially pass undefined or null as the value prop, the component starts life as an "uncontrolled" component. 
          //Once you interact with the component, we set a value and react changes it to a "controlled" component, and issues the warning.
          }
          <BubbleDialog 
            formOpen = {bubble.id===this.state.formOpen}
            handleFormClose = {this.handleFormClose}
            //handleFormChange = {this.handleFormChange}
            //handleFormCoordChange = {this.handleFormCoordChange}
            title = {'View/Edit Bubble'}
            actionName = {'update'}
            actionName2 = {'delete'}
            action = {(bubble)=>this.props.bubbleContentUpdate(bubble)}
            action2 = {(id)=>this.props.deleteBubbleFromList(id)}
            bubble = {bubble}
          />
        </ListItem>
        );
    });
    return (
      <div className={classes.root}>
      <List component = 'nav'>
        {bubbleDivs}
      </List>
      </div>
    );
  }
}

BubbleList.propTypes = {
  classes: PropTypes.object.isRequired, //to support withStyles
};

export default withStyles(styles)(BubbleList);
/*
<header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>*/