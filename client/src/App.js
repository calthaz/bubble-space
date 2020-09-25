import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Navigation from './Navigation';
import HeaderBar from './HeaderBar';
import BubbleSpace from './BubbleSpace';
import BubbleList from './BubbleList';
import globalVars from './Constants';
import axios from "axios";
import BubbleMap from './BubbleMap';

import Fab from '@material-ui/core/Fab'

import { createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import { ThemeProvider } from '@material-ui/styles';


const spreadsheet = require("./bubble-spreadsheet.json")

const apiURL = "http://localhost:3001";
//const apiURL = "http://ec2-34-208-42-160.us-west-2.compute.amazonaws.com:3001";
const io = require('socket.io-client');
const socket = io.connect(apiURL, { transport : ['websocket', 'xhr-polling'] }
);


const theme = createMuiTheme({
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: '#d500f9',
    },
  },
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
    this.state = {
    	showSpace: true,
    	showList:true,
    	connected:true
    };

    //that = undefined;
    //let arr = Array(rows).fill().map(() => Array(columns).fill(0));
  	space = Array(spaceHeight).fill().map(() => Array(spaceWidth).fill(0));
  	let SIZES = [0,1,2,3,4,5,6];
  	let MOVES = [[0,-1], [-1,-1], [1,-1], 
				[-1, 0], [1, 0], 
				[0, 1], [-1, 1], [1, 1]];
	const radiusOffset = 6;
    this.state = { 
    	...this.state,
	    spaceWidth: 150,
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
						cover[i][j]=1;//Why i j here??
					}
					if(shadow[j][i]===1 && ((i-move[0]>2*r||i-move[0]<0)
						||(j-move[1]>2*r||j-move[1]<0)
						||(shadow[j-move[1]][i-move[0]]===0))){
						release[i][j]=-1;//why i j here??
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

    //index.js:2178 Warning: Can't call setState on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. 
    //Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the App component.
    this.state.spaceWidth=spaceWidth;
    this.state.spaceHeight=spaceHeight;
	this.synchronizeWithDBandLS();
	this.state.animationHandle = null;
  };
	//https://www.hawatel.com/blog/handle-window-resize-in-react/
	/**
	 * Calculate & Update state of new dimensions
	 */
	updateDimensionsAsWindowResizes = ()=> {
	  	//return; //todo 
	  	let w = 0;
	    if(window.innerWidth < 500) {
	    	this.setState({showSpace: false});
	    	//w = Math.floor(500/this.state.gridSize);        
	      //this.setState({ spaceWidth, spaceHeight});
	    } else {
	    	this.setState({showSpace: true});
	      	w  = Math.round((window.innerWidth-300)/this.state.gridSize);
	      //this.setState({ spaceWidth, spaceHeight });
	      this.updateSpaceDimensions(w, spaceHeight);
	      this.setState({ spaceWidth, spaceHeight});
	      console.log("resize space to "+this.state.spaceWidth+", "+this.state.spaceWidth+" with gridSize "+this.state.gridSize);
	    }
	    
	};

	/**
	 * Add event listener
	 */
	componentDidMount() {
	    this.updateDimensionsAsWindowResizes();
	    window.addEventListener("resize", this.updateDimensionsAsWindowResizes);
	    let that = this;
	    socket.on("addToClients", function(bubble){
			console.log("[socket.on] addToClients", bubble)
	    	let pos = that.putBubble(bubble, 0, 0);
			bubble.pos=pos; 			
	    	//should update pos?
	    	that.setState({
	      		bubbles: that.state.bubbles.concat([bubble]),
	      		//maxId: bubble.id,
	      		spaceWidth,
	      		spaceHeight,
	    	});
	    });
	    socket.on("updateClients", function(bubble){
	    	const bubbles = that.state.bubbles.slice();
		  	let i=0;
		  	for(; i<bubbles.length; i++){
		  		if(bubbles[i].id === bubble.id){
		  			bubbles[i]=bubble;
		  			that.removeBubbleFromSpace(bubble.id); 
		  			bubble.pos = that.putBubble(bubble, 0, 0);
		  			that.setState({spaceHeight, spaceWidth})
		  			break;
		  		}
		  	}
		  	that.setState({
		  		bubbles
		  	});
	    });
	    socket.on("deleteInClients", function(id){
	    	var bubbles = that.state.bubbles.slice();
		  	let i=0;
		  	for(; i<bubbles.length; i++){
		  		if(bubbles[i].id === id){
		  			bubbles.splice(i, 1);
		  			that.removeBubbleFromSpace(id); 
		  			break;
		  		}
		  	}
		  	that.setState({
		  		bubbles
		  	});
	    });
	};

	/**
	 * Remove event listener
	 */
	componentWillUnmount() {
	    window.removeEventListener("resize", this.updateDimensionsAsWindowResizes);
	};

	synchronizeWithDBandLS = () =>{
		let tempBubbles = []
		/*[{
			id: 1,
			coord:[1,1], 
			title: 'something happy and exciting',
			date: '2018-05-08',
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
			date: '2018-05-04',
			situation: 'German midterm, Vicky had to go home, awkward questions, went swimming, played piano with Jing, tried her dresses, looked good.',
			thoughts: 'No particular thoughts',
			feelings: 'sad, tired and wanna cry. i can actully cry without thinking about anything',
			tags: ['tired', 'cry'],
			active: true,
			pos:[],
		  }]; //temporary */
		
		
		if(window.localStorage.getItem("bubbleList")){
			let temp = JSON.parse(window.localStorage.getItem("bubbleList"));
			console.log("Has a list");
			//this.state.bubbles = temp.sort(compareMoodCoord);
			fetch(apiURL+"/api/getData") //proxy to localhost:3001/api/getData see server.js
				.then(data => data.json())
				.then((res)=>{
					if(res.success && (res.data == undefined || res.data.length === 0)){ 
						//db is empty
						console.log("ls not empty, db empty");
						//this.state.bubbles = temp.sort(compareMoodCoord);
						for (var i = temp.length - 1; i >= 0; i--) {   
							let curr=i;  			
							axios.post(apiURL+"/api/putData", temp[i])
							.then((res)=>{
								if(res.data.success){
									console.log("before emitting addedToDB", temp[curr])//i=-1
									socket.emit("addedToDB",  temp[curr]); 
								}else{
									console.log("/putData error after successful connection", res.data);
								}
							});
						}
					}else if(res.error){
						//db is not accessible
						alert("ls not empty, db is not accessible at init.")
						tempBubbles = temp.sort(compareMoodCoord);
						
						for (let i = 0; i < tempBubbles.length; i++) {
							tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);	
						}
						
						this.setState({bubbles: tempBubbles})
					}else if(res.data.length > 0){
						//db is not empty
						console.log("ls not empty, db not empty")
						tempBubbles = res.data;				
						for (let i = 0; i < tempBubbles.length; i++) {
							tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);	
						}
						this.setState({bubbles: tempBubbles})
						window.localStorage.setItem("bubbleList", JSON.stringify(this.state.bubbles));
  						console.log("list saved");
					}else{
						alert("edge case in ls not empty")
					}
				}).catch((error)=>{
					alert("ls not empty, db is not accessible at init.", error)
					console.log(temp)
					tempBubbles = temp.sort(compareMoodCoord);
					for (let i = 0; i < tempBubbles.length; i++) {
						tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);	
					}
					this.setState({bubbles: tempBubbles})
				});
		}else{//localStorage is empty
			fetch(apiURL+"/api/getData") //proxy to localhost:3001/api/getData see server.js
				.then(data => data.json())
				.then((res)=>{
					if(res.success && (res.data == undefined || res.data.length === 0)){ 
						//db is empty
						console.log("ls empty, db empty");
						let temp = spreadsheet
						window.localStorage.setItem("bubbleList", JSON.stringify(temp));
						for (var i = temp.length - 1; i >= 0; i--) {   
							let curr=i;  			
							axios.post(apiURL+"/api/putData", temp[i])
							.then((res)=>{
								if(res.data.success){
									console.log("before emitting addedToDB", temp[curr])//i=-1
									socket.emit("addedToDB",  temp[curr]); 
								}else{
									console.log("/putData error after successful connection", res.data);
								}
							});
						}
					}else if(res.error){
						//db is not accessible
						alert("ls empty, db is not accessible at init.", res.error)
						let temp = spreadsheet
						console.log(temp)
						tempBubbles = temp.sort(compareMoodCoord);
						for (let i = 0; i < tempBubbles.length; i++) {
							tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);	
						}
						this.setState({bubbles: tempBubbles})
						window.localStorage.setItem("bubbleList", JSON.stringify(temp));
					}else if(res.data.length > 0){
						//db is not empty
						tempBubbles = res.data;
						for (let i = 0; i < tempBubbles.length; i++) {
							tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);	
						}
						this.setState({bubbles: tempBubbles})
						window.localStorage.setItem("bubbleList", JSON.stringify(this.state.bubbles));
  						console.log("list from db saved");
					}else{
						alert("edge case in ls empty")
					}
				}).catch((error)=>{
					alert("ls empty, db is not accessible at init.", error)
					let temp = spreadsheet
					console.log(temp)
					tempBubbles = temp.sort(compareMoodCoord);
					
					for (let i = 0; i < tempBubbles.length; i++) {
						tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);	
					}
					
					this.setState({bubbles: tempBubbles})
					window.localStorage.setItem("bubbleList", JSON.stringify(temp));
				});
		}
			/**/
			//this.state.maxId = 36;
		
		for (let i = 0; i < tempBubbles.length; i++) {
			tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);	
		}
		
		this.state.bubbles=tempBubbles;
	}

  	/*
	Turn a 2x2 map of points into an array of coordinates with non-zero values translated with offset (X, Y)
  	*/
  	readCoords = (chart, offsetX, offsetY)=>{
		let count = 0;
		for(let i=0; i<chart.length; i++){
			for(let j=0; j<chart[0].length; j++){
				if(chart[i][j]!==0){
					count++;
				}
			}
		}
		let pts = Array(count).fill().map(() => [0,0]);
		count=0;
		for(let i=0; i<chart.length; i++){
			for(let j=0; j<chart[0].length; j++){
				if(chart[i][j]!==0){
					pts[count][0]=i-offsetX;
					pts[count][1]=j-offsetY;
					count++;
				}
			}
		}
		return pts;
	}

	/**
	activate/deactivate bubble with id
	*/
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
 	
 	/** 
 	put bubble with id to the top of the bubble list
 	*/
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
	    //let currentIds = this.state.bubbles.map(bubble => bubble.id);
    	let idToBeAdded =Math.floor(Math.random()*360)//.toString(36).slice(2)
    	//while (currentIds.includes(idToBeAdded)) {
      	//	++idToBeAdded;
   		//}
   		bubble.id = idToBeAdded;
	    bubble.active = true;
	    axios.post(apiURL+"/api/putData", bubble)
		    .then(function (res) {
		      if(res.data.success){
		        socket.emit("addedToDB", bubble); 
		      }else{
		        console.log(res.data);
		      }
		    }); 
		/* on addToClients*/
	};

	/**
	update the bubble with matching id with the following content
	*/
	updateBubble = (bubble) => {
	  	console.log("Update bubble id: "+bubble.id);
	  	axios.post(apiURL+"/api/updateData", bubble)
	  	.then(function (res) {
	      if(res.data.success){
	        socket.emit("updatedDB", bubble); 
	      }else{
	        console.log(res.data);
	      }
	    });
	    /* on updateClients
	  	*/
	};

	deleteBubble = (id) => {
	  	console.log("Delete bubble id: "+id);
	  	axios.delete(apiURL+"/api/deleteData", {
	      data: {id: id}
	    }).then(function (res) {
	      if(res.data.success){
	        socket.emit("deletedInDB", id); 
	      }else{
	        console.log(res.data);
	      }
	    });
	    /*on deleteInClients
	  	*/
  	};

	//flag: enforced stupid duplicate in Bubble.js
	/**
	calculate bubble size based on its coordinate in the mood plane
	*/
	calculateRadius = (coord) => {
	  	//var SIZES = [0,1,2,3,4,5,6];
	  	let r = (Math.abs(coord[0])+Math.abs(coord[1]));
	    return r===0 ? 0 : (Math.floor((r-1)/2)); 
	    //return 3; //some category 
	};

	/**
	Put one bubble into the bubble space, increase height when necessary
	use the bubble id to hold its place
	*/
  	//RECURSION
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
			return this.putBubble(b, startX, startY);
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

	/*
	the passed in height is the minimun height and so if width< oldw and bubbles need to be relocated, 
	the height of the resulting space maybe larger than height 
	*/
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
			spaceWidth = space.length;
    	//this.setState({ spaceWidth: width, spaceHeight: height, space });
		}else if(width >= oldw && height < oldh){
			let tempBubbles = this.state.bubbles.slice();
			// find area
			let area = Array(oldw).fill().map(() => Array(oldh-height).fill(-1));
			let affectedBubbleIDs = this.pointsOccupiedBy(this.readCoords(area, 0, 0), [0, height-1]); 
			for (let i = 0; i < affectedBubbleIDs.length; i++) {
				this.removeBubbleFromSpace(affectedBubbleIDs[i]);
			}
			//cut away the array
			let newSpace =  space.slice().map( function(row){ return row.slice(0, height); });
			if(width>oldw){
				let padW = Array(width-oldw).fill().map(() => Array(height).fill(0));
				space = [...newSpace, ...padW];
			}
			spaceWidth = space.length;
			for (let i = 0; i < tempBubbles.length; i++) {
				if(affectedBubbleIDs.indexOf(tempBubbles[i].id)!==-1){
					tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);
				}
			}
			this.setState({bubbles: tempBubbles});

		}else if(width<oldw){
			let tempBubbles = this.state.bubbles.slice();
			// find area
			let area = Array(oldw-width).fill().map(() => Array(oldh).fill(-1));
			let affectedBubbleIDs = this.pointsOccupiedBy(this.readCoords(area, 0, 0), [width, 0]); 
			for (let i = 0; i < affectedBubbleIDs.length; i++) {
				this.removeBubbleFromSpace(affectedBubbleIDs[i]);
			}
			
			//cut away the array
			space =  space.slice(0, width).map( function(row){ return row.slice(); });
			spaceWidth = space.length;
			for (let i = 0; i < tempBubbles.length; i++) {
				if(affectedBubbleIDs.indexOf(tempBubbles[i].id)!==-1){
					tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);
				}
			}
			this.setState({bubbles: tempBubbles});
		}
		
    	spaceHeight = space[0].length; 
	};


	/**
	 * test if pts in space are nonzero
	 */
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

	/**
	 * get bubble ids that occupies the points
	 */
  	pointsOccupiedBy = (pts,offset) => {
		let x = offset[0];
		let y = offset[1];
		//let space = this.state.space.slice();
		let affected = [];
		for(let i=0; i<pts.length; i++ ){
			let pt = pts[i];
			if(//(pt[0]!=0||pt[1]!=0) && 
					(!(pt[0]+x >= 0 && pt[0]+x < spaceWidth 
					&& pt[1]+y >= 0 && pt[1]+y < spaceHeight) 
					|| space[pt[0]+x][pt[1]+y]!== 0)){
					let id = space[pt[0]+x][pt[1]+y];
					if(affected.indexOf(id)===-1){
						affected.push(id);
					}
			}
		}
		return affected;
	};
	
	/**
	 * set covered points to be zero
	 */
	release=(pts, offset)=> {
		let x = offset[0];
		let y = offset[1];
		for(let pt of pts ){
			space[pt[0]+x][pt[1]+y]=0;
		}
	}

	/**
	 * cover space with id
	 */
	cover=(pts, offset,id) => {
		let x = offset[0];
		let y = offset[1];
		for(let pt of pts ){
			space[pt[0]+x][pt[1]+y]=id;
		}
	}


	/**
	 * one step in moving those bubbles upwords
	 * 
	 */
	startPhysics = ()=> {
		console.log("physics");
		let bubbleList = shuffle(this.state.bubbles);
		for(let b of bubbleList){
			for(let i=0; i<=4; i++){//only moves towards the top
				let move = this.state.MOVES[i];
				if(!this.pointsAreOccupied(
					this.state.moveCover[this.calculateRadius(b.coord)+1][i], b.pos)){
					console.log("pointsnotoccupied", b);
					console.log(
							"Moved it with move: ("+move[0]+", "+move[1]+")");
					this.release(this.state.moveRelease[this.calculateRadius(b.coord)+1][i], b.pos);
					this.cover(this.state.moveCover[this.calculateRadius(b.coord)+1][i], b.pos, b.id);
					b.pos[0] = b.pos[0]+move[0];
					b.pos[1] = b.pos[1]+move[1];
					break;
				}
			}
		}
		this.setState({bubbles: bubbleList})
	}

	animate = ()=>{
		this.state.animationHandle = requestAnimationFrame(this.animate)
		this.startPhysics()
	}

	toggleAnimation =()=>{
		console.log("toggleAnimation")
		if(!this.state.animationHandle){
			console.log("start animation")
			this.animate()
		}else{
			console.log("end animation")
			cancelAnimationFrame(this.state.animationHandle)
			this.state.animationHandle=null
		}
	}


	saveList = () => {
		window.localStorage.setItem("bubbleList", JSON.stringify(this.state.bubbles));
		console.log("list saved");
	}

	sortListByTime = () => {
		this.setState({bubbles: this.state.bubbles.sort(compareDate)});
  }
  	render() {
	    return (
			<ThemeProvider theme={theme}>
	      	<div className="App">
		        {this.state.showSpace && <BubbleSpace 
		          bubbles={this.state.bubbles} 
		          spaceWidth = {this.state.spaceWidth}
		          spaceHeight = {this.state.spaceHeight}
		          gridSize = {this.state.gridSize}
		          radiusOffset = {this.state.radiusOffset}
		          focusBubble = {this.focusBubble}
		        />}
				<HeaderBar/>
		        <Navigation 
		          addBubble = {this.addBubble}
		          saveList = {this.saveList}
				  sortListByTime = {this.sortListByTime}
				  physicsAction = {this.toggleAnimation}
		        />
		        <BubbleList
		          bubbles={this.state.bubbles} 
		          bubbleStateUpdate = {this.handleBubbleStateUpdate}
		          bubbleContentUpdate = {this.updateBubble}
		          deleteBubbleFromList = {this.deleteBubble}
		        />
				<BubbleMap/>
	      	</div>
			</ThemeProvider>
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

function compareMoodCoord(a,b) {
	if(a.coord[0]<b.coord[0]){
		return -1;
	}else if(a.coord[0]>b.coord[0]){
		return 1;
	}else{
		if(a.coord[1]<b.coord[1]){
			return -1;
		}else if(a.coord[1]>b.coord[1]){
			return 1;
		}
	}
	return 0;
}

/*ascending order*/
function compareDate(a, b){
	if(a.date === "" && b.date !== "") return -1;
	if(b.date === "" && a.date !== "") return 1;
	let d1 = new Date(a.date);
	let d2 = new Date(b.date);
	return (d1 > d2) - (d2 < d1);
}

export default App;
/*<header className="App-header">
  <img src={logo} className="App-logo" alt="logo" />
  <h1 className="App-title">Welcome to React</h1>
</header>
<p className="App-intro">
  To get started, edit <code>src/App.js</code> and save to reload.
</p>*/