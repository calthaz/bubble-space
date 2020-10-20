import {calculateRadius} from "@/bubble/bubbleHelper"
/*
Turn a 2x2 map of points into an array of coordinates with non-zero values translated with offset (X, Y)
*/
let readCoords = (chart, offsetX, offsetY)=>{
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

let spaceHeight = 100
let spaceWidth = 150
let space = Array(spaceWidth).fill().map(() => Array(spaceHeight).fill(0));
let SIZES = [0,1,2,3,4,5,6];
let MOVES = [[0,-1], [-1,-1], [1,-1], 
    [-1, 0], [1, 0], 
    [0, 1], [-1, 1], [1, 1]];
const radiusOffset = 1;//6;

//----------init shadows---------------------
let shadows=[]; 
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
  shadows.push(readCoords(shadow, r, r));			
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
    moveCover[n][m]=readCoords(cover, r-move[0],r-move[1]);
    moveRelease[n][m]=readCoords(release, r,r);
  }
}

/**
 * test if pts in space are nonzero
 */
let pointsAreOccupied = (pts,offset) => {
    let x = offset[0];
    let y = offset[1];
    //let space = this.state.space.slice();
    
    for(let i=0; i<pts.length; i++ ){
        let pt = pts[i];
        //console.log(pt)
        //if(!pt || !space){
        //    console.log("about to error")
        //}
        if((!(pt[1]+y >= 0 && pt[1]+y < spaceHeight
                && pt[0]+x >= 0 && pt[0]+x < spaceWidth ) 
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
let pointsOccupiedBy = (pts,offset) => {
    let x = offset[0];
    let y = offset[1];
    //let space = this.state.space.slice();
    let affected = [];
    for(let i=0; i<pts.length; i++ ){
        let pt = pts[i];
        //console.log(pt)
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

let removeBubbleFromSpace = (id)=>{
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
let updateSpaceDimensions = (bubbles, width, height) => {
    //space[width][height]
    let oldw = spaceWidth;
    let oldh = spaceHeight;
    let tempBubbles = bubbles.slice();

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
        //let tempBubbles = bubbles.slice();
        // find area
        let area = Array(oldw).fill().map(() => Array(oldh-height).fill(-1));
        let affectedBubbleIDs = pointsOccupiedBy(readCoords(area, 0, 0), [0, height-1]); 
        for (let i = 0; i < affectedBubbleIDs.length; i++) {
            removeBubbleFromSpace(affectedBubbleIDs[i]);
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
                tempBubbles[i].pos = putBubble(tempBubbles[i],0,0);
            }
        }
        //this.setState({bubbles: tempBubbles});

    }else if(width<oldw){
        //let tempBubbles = this.state.bubbles.slice();
        // find area
        let area = Array(oldw-width).fill().map(() => Array(oldh).fill(-1));
        console.log(area)
        let affectedBubbleIDs = pointsOccupiedBy(readCoords(area, 0, 0), [width, 0]); 
        for (let i = 0; i < affectedBubbleIDs.length; i++) {
            removeBubbleFromSpace(affectedBubbleIDs[i]);
        }
        
        //cut away the array
        space =  space.slice(0, width).map( function(row){ return row.slice(); });
        spaceWidth = space.length;
        for (let i = 0; i < tempBubbles.length; i++) {
            if(affectedBubbleIDs.indexOf(tempBubbles[i].id)!==-1){
                let xy = putBubble(tempBubbles[i],0,0);
                while(!xy || xy.length<=0){
                    let res = updateSpaceDimensions(bubbles, 
                        spaceWidth, spaceHeight + 20);
                    tempBubbles =  res.bubbles

                    spaceWidth = res.spaceWidth
                    spaceHeight = res.spaceHeight

                    xy = spaceOrganizer.putBubble(tempBubbles[i],0,0)
                }
            }
        }
        //this.setState({bubbles: tempBubbles});
    }
    spaceHeight = space[0].length; 
    return {bubbles: tempBubbles, spaceWidth, spaceHeight}
};
    
/**
Put one bubble into the bubble space, increase height when necessary
use the bubble id to hold its place
*/
let putBubble = (b, startX, startY) => {
    let shadow = shadows[calculateRadius(b)];
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
        //console.log(calculateRadius(b)+1)
        //console.log(shadows[calculateRadius(b)+1])
        if(!pointsAreOccupied(shadows[calculateRadius(b)+1], [x,y])){//+1...
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
    /*if(!placed){
        updateSpaceDimensions(width, height + radiusOffset*3);
        console.log("width:"+space.length+"; height:"+space[0].length);
        return putBubble(b, startX, startY);
    }*/
    return xy;
}

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

export let spaceOrganizer = {
    putBubble,
    updateSpaceDimensions,
    removeBubbleFromSpace
}