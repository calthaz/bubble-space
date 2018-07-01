import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Navigation from './Navigation';
import BubbleSpace from './BubbleSpace';
import BubbleList from './BubbleList';
import { createMuiTheme } from 'material-ui/styles';
import globalVars from './Constants';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  spacing: {
  	unit: '3px',
  }
});

//buffer zone--------------------
var space = null;
var spaceWidth = globalVars.MIN_SPACE_WIDTH;
var spaceHeight = globalVars.MIN_SPACE_HEIGHT;
//------------------------------

class App extends Component {
  constructor(props) {
    super(props);
    //read list from database/local host
    //calculate lengths
    this.state = {};
    if(window.localStorage.getItem("bubbleList")){
    	let temp = JSON.parse(window.localStorage.getItem("bubbleList"));
			this.state.bubbles = temp;
			this.state.maxId = this.state.bubbles.length; 
			for (var i = 0; i < temp.length; i++) {
				let n = parseInt(temp[i].id);
				if(!isNaN(n) && n> this.state.maxID){
					this.state.maxId = n;
				}
			}
			console.log("Has a list");
			console.log("maxId: "+ this.state.maxId);
		}else{
			this.state.bubbles = [{
		        id: 1,
		        coord:[1,1], 
		        title: 'something happy and exciting',
		        date: 'may 8, 2018',
		        situation: 'just learned first half of the Fourier transform and started building this again.',
		        thoughts: 'I should probably write a matlab demo about Fourier transform',
		        feelings: 'excited, attempting???',
		        tags: ['coding', 'math'],
		        active: true,
		        pos: [],
		      },
		      {
		        id: 2,
		        coord:[-3,-5], 
		        title: 'sad sunny friday',
		        date: 'may 4, Friday 2018',
		        situation: 'German midterm, Vicky had to go home, awkward questions, went swimming, played piano with Jing, tried her dresses, looked good.',
		        thoughts: 'No particular thoughts',
		        feelings: 'sad, tired and wanna cry. i can actully cry without thinking about anything',
		        tags: ['tired', 'cry'],
		        active: true,
		        pos:[],
		      }];
		  this.state.maxId = 2;
		}
    //let arr = Array(rows).fill().map(() => Array(columns).fill(0));
  	space = Array(spaceHeight).fill().map(() => Array(spaceWidth).fill(0));
  	let SIZES = [0,1,2,3,4,5,6];
  	let MOVES = [[0,-1], [-1,-1], [1,-1], 
				[-1, 0], [1, 0], 
				[0, 1], [-1, 1], [1, 1]];
		const radiusOffset = 6;
    this.state = { 
    	...this.state,
	    spaceWidth: 100,
	    spaceHeight: 100,
	    gridSize: 7,//may update...
	    //SIZES: SIZES,//corresponds to radius 2,3,4,5,6,6-shadow
			MOVES: MOVES,
			//space: space,
			radiusOffset,//needed
    };
    //----------init shadows---------------------
    let shadows=[]; 
		/*
			private static int[][][][] moveCover = new int[SIZES.length][MOVES.length][][];
			private static int[][][][] moveRelease = new int[SIZES.length][MOVES.length][][];
		*/
		let moveCover = Array(SIZES.length).fill().map(() => Array(MOVES.length));
		let moveRelease = Array(SIZES.length).fill().map(() => Array(MOVES.length));
    for(let n=0; n<SIZES.length; n++){//for each size once and for all
			let r = n+radiusOffset;
			let shadow = Array(2*r+1).fill().map(() => Array(2*r+1).fill(0));
			let x = 0;
			let y = 0;
			for(let j = y-r; j < y+r+1; j++){ //from y-r to y+r there are 2*r+1 grids right? 
				for(let i = x-r; i<x+r+1; i++){
					if(!(Math.sqrt((i-x)*(i-x)+(j-y)*(j-y))>r)){
						shadow[r+i][r+j]=1;
					}
				}
			}
			printArray(shadow);
			shadows.push(this.readCoords(shadow, r, r));			
			for(let m=0; m<MOVES.length; m++){
				const move = MOVES[m];
				let cover = Array(2*r+1).fill().map(() => Array(2*r+1).fill(0));
				let release = Array(2*r+1).fill().map(() => Array(2*r+1).fill(0));
				for(let j=0; j<(2*r+1); j++){
					for(let i=0; i<(2*r+1); i++){
						if(shadow[j][i]===1 && ((i+move[0]>2*r||i+move[0]<0)
								||(j+move[1]>2*r||j+move[1]<0)
								||(shadow[j+move[1]][i+move[0]]===0))){
							cover[j][i]=1;
						}
						if(shadow[j][i]===1 && ((i-move[0]>2*r||i-move[0]<0)
							||(j-move[1]>2*r||j-move[1]<0)
							||(shadow[j-move[1]][i-move[0]]===0))){
							release[j][i]=-1;
						}
					}
				}
				//System.out.println("("+move[0]+","+move[1]+")");
				moveCover[n][m]=this.readCoords(cover, r-move[0],r-move[1]);
				moveRelease[n][m]=this.readCoords(release, r,r);
			}
		}
 		this.state ={
			...this.state,
			SHADOWS: shadows,
			moveRelease,
			moveCover,
		}
    //----------put bubbles----------------------
    let lastX = 0;
    let lastY = 0;
    const bubbles = this.state.bubbles;//.slice();
    console.log(bubbles.length);
    for (let i = 0; i < bubbles.length; i++) {
    	if(bubbles[i].active){
    		let pos = this.putBubble(bubbles[i], lastX, lastY);
  			if(pos[0]>0){
					//lastX = Math.min(this.state.spaceWidth, pos[0]+4);
					//lastY = Math.min(this.state.spaceHeight, pos[1]+4);
					bubbles[i].pos=pos; 
					lastX = pos[0];
					lastY = pos[1];
					//if(i%10===0)
						//console.log("Put bubble at "+pos[0]+", "+pos[1]+" with gridSize "+this.state.gridSize);
				}
    	}
    	
    }
    this.state.bubbles = bubbles;
    //index.js:2178 Warning: Can't call setState on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. 
    //Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the App component.
    this.state.spaceWidth=spaceWidth;
    this.state.spaceHeight=spaceHeight;
  };
  //https://www.hawatel.com/blog/handle-window-resize-in-react/
  /**
   * Calculate & Update state of new dimensions
   */
  updateDimensionsAsWindowResizes = ()=> {
  	//return; //todo 
  	let w = 0;
    if(window.innerWidth < 500) {
    	w = Math.floor(500/this.state.gridSize);        
      //this.setState({ spaceWidth, spaceHeight});
    } else {
      w  = Math.round((window.innerWidth-10)/this.state.gridSize);
      //this.setState({ spaceWidth, spaceHeight });
    }
    this.updateSpaceDimensions(w, spaceHeight);
    this.setState({ spaceWidth, spaceHeight});
    console.log("resize space to "+this.state.spaceWidth+", "+this.state.spaceWidth+" with gridSize "+this.state.gridSize);
  };

  /**
   * Add event listener
   */
  componentDidMount() {
    this.updateDimensionsAsWindowResizes();
    window.addEventListener("resize", this.updateDimensionsAsWindowResizes);
  };

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensionsAsWindowResizes);
  };

  readCoords = (chart, offsetX, offsetY)=>{
		let count = 0;
		for(let i=0; i<chart.length; i++){
			for(let j=0; j<chart[0].length; j++){
				if(chart[i][j]!=0){
					count++;
				}
			}
		}
		let pts = Array(count).fill().map(() => [0,0]);
		count=0;
		for(let i=0; i<chart.length; i++){
			for(let j=0; j<chart[0].length; j++){
				if(chart[i][j]!==0){
					pts[count][0]=j-offsetX;
					pts[count][1]=i-offsetY;
					count++;
				}
			}
		}
		return pts;
	}

  handleBubbleStateUpdate = (id, state) => {
  	var bubbles = this.state.bubbles.slice();
  	let i=0;
  	for(; i<bubbles.length; i++){
  		if(bubbles[i].id === id){
  			bubbles[i].active = state;
  			i=-1;
  			break;
  		}
  	}
  	if(i!==-1){
  		console.log("Could not find bubble with id "+id);
  	}  	
  	this.setState({
  		bubbles
  	})
  };
 	
 	focusBubble = (id) =>{
 		console.log("Focus bubble id: "+id);
  	let bubbles = this.state.bubbles.slice();
  	let b;
  	let i=0;
  	for(; i<bubbles.length; i++){
  		if(bubbles[i].id === id){
  			b = bubbles.splice(i, 1); //b is an array with length 1
  			break;
  		}
  	}
  	//console.log(b);
  	bubbles = [...b, ...bubbles];
  	//console.log(bubbles);
  	this.setState({
  		bubbles
  	});
 	}

 	addBubble = (bubble) => {
    //addBubble(bubble) { 
  	//what's the difference between these two ways of declaring a function???
  	//this.maxId will be undefined
    //check bubble quality
    bubble.id = this.state.maxId+1;
    bubble.active = true; 
    this.putBubble(bubble,0,0);
    this.setState({
      bubbles: this.state.bubbles.concat([bubble]),
      maxId: bubble.id,
      spaceWidth,
      spaceHeight,
    });
  };

  updateBubble = (bubble) => {
  	console.log("Update bubble id: "+bubble.id);
  	const bubbles = this.state.bubbles.slice();
  	let i=0;
  	for(; i<bubbles.length; i++){
  		if(bubbles[i].id === bubble.id){
  			bubbles[i]=bubble;
  			this.removeBubbleFromSpace(bubble.id); 
  			bubble.pos = this.putBubble(bubble, 0, 0);
  			break;
  		}
  	}
  	this.setState({
  		bubbles
  	});
  };

//flag: enforced stupid duplicate in Bubble.js
  calculateRadius = (coord) => {
  	//var SIZES = [0,1,2,3,4,5,6];
  	let r = (Math.abs(coord[0])+Math.abs(coord[1]));
    return r===0 ? 0 : (Math.floor((r-1)/2)); 
    //return 3; //some category 
  };

  //RECURSION increase height when necessary
  //remember to update state afterwards...
  putBubble = (b, startX, startY) => {
		let shadow = this.state.SHADOWS[this.calculateRadius(b.coord)];
		let xy = [];
		let width = spaceWidth;
		let height = spaceHeight;
		//xy.push(-1);
		let placed = false;
		for(let i=startX+startY*width; i<width*height; i++){
			let x = i%width;
			let y = Math.floor(i/width);
			//let vacant = true;
			//let space = this.state.space.slice();
			
			if(!this.pointsAreOccupied(this.state.SHADOWS[this.calculateRadius(b.coord)+1], [x,y])){//+1...
				for(let i=0; i<shadow.length; i++){
					let pt = shadow[i]; 
					space[pt[0]+x][pt[1]+y]=b.id;
				}
				xy[0]=x;
				xy[1]=y;
				b.pos=xy;
				console.log(b.id + " is placed at ("+x+","+y+")");
				//this.setState({space});
				placed = true;
				//bubbleList.add(b);
				break;
			}			
		}
		if(!placed){
			this.updateSpaceDimensions(width, height+this.state.radiusOffset*3);
			console.log("width:"+space.length+"; height:"+space[0].length);
			this.putBubble(b, startX, startY);
		}
		return xy;
	}

	removeBubbleFromSpace = (id)=>{
		for (let i = 0; i < spaceWidth; i++) {
			for (let j = 0; j < spaceHeight; j++) {
				if(space[i][j] === id) space[i][j] = 0;
			}
		}
	}

	updateSpaceDimensions = (width, height) => {
		//space[width][height]
		let oldw = spaceWidth;
		let oldh = spaceHeight;
		if(width>=oldw && height>=oldh){
			let padH = Array(height-oldh).fill(0);
			//no bubble need to be relocated
			let olds = space.slice();			
			if(height>oldh){
				for(let i=0; i<oldw; i++){
	      	olds[i] = [...olds[i], ...padH];
	    	}
			}
			space = olds;
			if(width>oldw){
				let padW = Array(width-oldw).fill().map(() => Array(height).fill(0));
				space = [...space, ...padW];
			}
    	//this.setState({ spaceWidth: width, spaceHeight: height, space });
    	spaceWidth = width;
    	spaceHeight = height; 
		}else{
			// need to relocate bubbles...
		}
	};

  pointsAreOccupied = (pts,offset) => {
		let x = offset[0];
		let y = offset[1];
		//let space = this.state.space.slice();
		for(let i=0; i<pts.length; i++ ){
			let pt = pts[i];
			if(//(pt[0]!=0||pt[1]!=0) && 
					(!(pt[0]+x >= 0 && pt[0]+x < spaceWidth 
					&& pt[1]+y >= 0 && pt[1]+y < spaceHeight) 
					|| space[pt[0]+x][pt[1]+y]!== 0)){
				//this (x,y) doesn't work
				return true;
				
			}
		}
		return false;
	};

  deleteBubble = (id) => {
  	console.log("Delete bubble id: "+id);
  	var bubbles = this.state.bubbles.slice();
  	let i=0;
  	for(; i<bubbles.length; i++){
  		if(bubbles[i].id === id){
  			bubbles.splice(i, 1);
  			this.removeBubbleFromSpace(id); 
  			break;
  		}
  	}
  	this.setState({
  		bubbles
  	});
  };

  saveList = () => {
  	window.localStorage.setItem("bubbleList", JSON.stringify(this.state.bubbles));
  	console.log("list saved");
  }

  render() {
    return (
      <div className="App">
        <BubbleSpace 
          bubbles={this.state.bubbles} 
          spaceWidth = {this.state.spaceWidth}
          spaceHeight = {this.state.spaceHeight}
          gridSize = {this.state.gridSize}
          radiusOffset = {this.state.radiusOffset}
          focusBubble = {this.focusBubble}
        />
        <Navigation 
          addBubble = {this.addBubble}
          saveList = {this.saveList}
        />
        <BubbleList
          bubbles={this.state.bubbles} 
          bubbleStateUpdate = {this.handleBubbleStateUpdate}
          bubbleContentUpdate = {this.updateBubble}
        />
      </div>
    );
  }
}
//https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(array) {
	  const arr = [...array];
    let counter = arr.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
}

//2D sort of flipped but it doesn't matter
function printArray(arr){
		let out = "";
		for(let y=0; y<arr.length; y++){
			for(let x=0; x<arr[0].length; x++){
				out+=arr[y][x]+" ";
			}
			out+="\n";
		}
		console.log(out);
}

export default App;
/*
<header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>*/