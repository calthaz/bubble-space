import Vue from 'vue'
import Vuex from 'vuex'
import {apiUrl} from '../api-config'
import {spaceOrganizer} from './spaceOrganizer';
const spreadsheet = require("../bubble/bubble-spreadsheet.json")

Vue.use(Vuex)

function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
    }
    return data;
  })
}
  
export default new Vuex.Store({
  state: {
    //showSpace: true,
    //showList:true,
    connected:true,
    spaceWidth: 150,
	  spaceHeight: 100,
	  gridSize: 13,//7may update...
	  //SIZES: SIZES,//corresponds to radius 2,3,4,5,6,6-shadow
		//MOVES: MOVES,
		//space: space,
    radiusOffset: 6,//needed
    //SHADOWS: shadows,
		//moveRelease,
    //moveCover,
    bubbles: [{
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
      }] 
  },
  mutations: {
    setBubbles(state, bubbles){
      console.log("commit, set bubbles")
      state.bubbles = bubbles
    },

    addBubbleToState(state, bubble){
      console.log("commit, add bubble to state")
      state.bubbles = state.bubbles.concat([bubble]);
    },

    deleteBubbleInSpace(state, id){
      //var bubbles = that.state.bubbles.slice();
      let i=0;
      for(; i<state.bubbles.length; i++){
        if(state.bubbles[i].id === id){
          state.bubbles.splice(i, 1);
          spaceOrganizer.removeBubbleFromSpace(id); 
          break;
        }
      }
    },

    updateBubble (state, bubble){
      const bubbles = state.bubbles.slice();
      let i=0;
      for(; i<bubbles.length; i++){
        if(bubbles[i].id === bubble.id){
          bubbles[i]=bubble;
          spaceOrganizer.removeBubbleFromSpace(bubble.id); 
          break
        }
      }
    },

    putBubble(state, payload){
      let bubble=payload.bubble
      let startX=payload.startX
      let startY=payload.startY
      console.log("commit, put bubble in space")
      let xy = spaceOrganizer.putBubble(bubble, startX, startY);
      let tempBubbles = null;
      while(!xy  || xy.length<=0){
        
        let res = spaceOrganizer.updateSpaceDimensions(state.bubbles, 
          state.spaceWidth, state.spaceHeight + state.radiusOffset*3);

        tempBubbles =  res.bubbles

        state.spaceWidth = res.spaceWidth
        state.spaceHeight = res.spaceHeight

        xy = spaceOrganizer.putBubble(bubble, startX, startY)
      }
      if(tempBubbles){
        console.log("state.bubbles = tempBubbles")
        state.bubbles = tempBubbles;
      }
      let foundIndex = state.bubbles.findIndex(x => x.id == bubble.id);
      if(foundIndex!=-1){
        state.bubbles[foundIndex].pos = xy;
      }else{
        console.log('add bubble first before placement')
      }
    },
    updateSpaceDimensions(state, payload){
      let w = payload.width;
      let h = payload.height;
      let res = spaceOrganizer.updateSpaceDimensions(state.bubbles, w, h);

      let tempBubbles =  res.bubbles

      state.spaceWidth = res.spaceWidth
      state.spaceHeight = res.spaceHeight
      
      console.log('update bubbles in store update dimensions')
      console.log(tempBubbles)
      //for (b in tempBubbles){
      //  b.pos=[0, 0]
      //}
      state.bubbles = JSON.parse(JSON.stringify(tempBubbles));

    },
    saveBubblesToLS(state){
      window.localStorage.setItem("bubbleList", JSON.stringify(state.bubbles));
    }
  },
  ///////////////////////////////////////////////////////////////////////
  //////////////////////actions//////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////
  actions: {
    synchronizeWithDBandLS({commit}){
      let tempBubbles = []
      /*; //temporary */
      
      if(window.localStorage.getItem("bubbleList")){
        let temp = JSON.parse(window.localStorage.getItem("bubbleList"));
        console.log("Has a list");
        //this.state.bubbles = temp.sort(compareMoodCoord);
        fetch(apiUrl+"/api/getData", {method: 'POST'}) //proxy to localhost:3001/api/getData see server.js
          .then(handleResponse)
          .then((res)=>{
            if(res.success && (res.data == undefined || res.data.length === 0)){ 
              //db is empty
              console.log("ls not empty, db empty");
              //this.state.bubbles = temp.sort(compareMoodCoord);
              for (var i = temp.length - 1; i >= 0; i--) {   
                let curr=i;  			
                const requestOptions = {
                  method: 'POST',
                  body: JSON.stringify(temp[i]),
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                };
                fetch(apiUrl+"/api/putData", requestOptions)
                .then(handleResponse).then((res)=>{
                  if(res.success){
                    console.log("before emitting addedToDB", temp[curr])//i=-1
                    this._vm.$socket.emit("addedToDB",  temp[curr]); 
                  }else{
                    console.log("/putData error after successful connection", res.data);
                  }
                });
              }
            }else if(res.error){
              //db is not accessible
              alert("ls not empty, db is not accessible at init.")
              tempBubbles = temp.sort(compareMoodCoord);
              commit('setBubbles', tempBubbles)
              for (let i = 0; i < tempBubbles.length; i++) {
                commit('putBubble', {bubble:tempBubbles[i],startX:0,startY:0});	
              }

            }else if(res.data.length > 0){
              //db is not empty
              console.log("ls not empty, db not empty")
              tempBubbles = res.data;		
              commit('setBubbles', tempBubbles)		
              for (let i = 0; i < tempBubbles.length; i++) {
                commit('putBubble',  {bubble:tempBubbles[i],startX:0,startY:0});		
              }
              //this.setState({bubbles: tempBubbles})
              //window.localStorage.setItem("bubbleList", JSON.stringify(this.state.bubbles));
              commit('saveBubblesToLS');
              console.log("list saved");
            }else{
              alert("edge case in ls not empty")
            }
          }).catch((error)=>{
            alert("ls not empty, db is not accessible at init.", error)
            console.log(temp)
            tempBubbles = temp.sort(compareMoodCoord);
            commit('setBubbles', tempBubbles)
            for (let i = 0; i < tempBubbles.length; i++) {
              commit('putBubble', {bubble:tempBubbles[i],startX:0,startY:0});	
            }
            //this.setState({bubbles: tempBubbles})
          });
      }else{//localStorage is empty
        fetch(apiUrl+"/api/getData") //proxy to localhost:3001/api/getData see server.js
          .then(data => data.json())
          .then((res)=>{
            if(res.success && (res.data == undefined || res.data.length === 0)){ 
              //db is empty
              console.log("ls empty, db empty");
              let temp = spreadsheet
              window.localStorage.setItem("bubbleList", JSON.stringify(temp));
              for (var i = temp.length - 1; i >= 0; i--) {   
                let curr=i;  			
                const requestOptions = {
                  method: 'POST',
                  body: JSON.stringify(temp[i]),
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                };
                fetch(apiUrl+"/api/putData", requestOptions)
                .then(handleResponse).then((res)=>{
                  if(res.success){
                    console.log("before emitting addedToDB", temp[curr])//i=-1
                    this._vm.$socket.emit("addedToDB",  temp[curr]); 
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
              commit('setBubbles', tempBubbles)
              for (let i = 0; i < tempBubbles.length; i++) {
                commit('putBubble',  {bubble:tempBubbles[i],startX:0,startY:0});	
              }
              //this.setState({bubbles: tempBubbles})
              //window.localStorage.setItem("bubbleList", JSON.stringify(temp));
              commit('saveBubblesToLS');
              console.log("list saved");

            }else if(res.data.length > 0){
              //db is not empty
              tempBubbles = res.data;
              commit('setBubbles', tempBubbles)
              for (let i = 0; i < tempBubbles.length; i++) {
                commit('putBubble',  {bubble:tempBubbles[i],startX:0,startY:0});
              }
              //this.setState({bubbles: tempBubbles})
              //window.localStorage.setItem("bubbleList", JSON.stringify(this.state.bubbles));
              commit('saveBubblesToLS');
              console.log("list from db saved");
            }else{
              alert("edge case in ls empty")
            }
          }).catch((error)=>{
            alert("ls empty, db is not accessible at init.", error)
            let temp = spreadsheet
            console.log(temp)
            tempBubbles = temp.sort(compareMoodCoord);
            commit('setBubbles', tempBubbles)

            for (let i = 0; i < tempBubbles.length; i++) {
              commit('putBubble',  {bubble:tempBubbles[i],startX:0,startY:0});	
            }
            
            //this.setState({bubbles: tempBubbles})
            //window.localStorage.setItem("bubbleList", JSON.stringify(temp));
            commit('saveBubblesToLS');
          });
      }
        /**/
        //this.state.maxId = 36;
      
      /*for (let i = 0; i < tempBubbles.length; i++) {
        tempBubbles[i].pos = this.putBubble(tempBubbles[i],0,0);	
      }*/
      
      commit('setBubbles', tempBubbles);
    },

    addBubble ({commit}, bubble) {
	    //let currentIds = this.state.bubbles.map(bubble => bubble.id);
    	let idToBeAdded =Math.floor(Math.random()*360)//.toString(36).slice(2)
    	//while (currentIds.includes(idToBeAdded)) {
      	//	++idToBeAdded;
   		//}
   		bubble.id = idToBeAdded;
      bubble.active = true;

      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(bubble),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };
      console.log(this)
      fetch(apiUrl+"/api/putData", requestOptions)
      .then(handleResponse).then( (res)=>{
		      if(res.success){
		        this._vm.$socket.emit("addedToDB", bubble); 
		      }else{
		        console.log(res.data);
		      }
		    }); 
      /* on addToClients*/
      },
      /**
      update the bubble with matching id with the following content
      */
      updateBubble({commit}, bubble)  {
        console.log("Update bubble id: "+bubble.id);
        const requestOptions = {
          method: 'POST',
          body: JSON.stringify(bubble),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        };
  
        fetch(apiUrl+"/api/updateData", requestOptions)
        .then(handleResponse).then( (res)=> {
          if(res.success){
            this._vm.$socket.emit("updatedDB", bubble); 
          }else{
            console.log(res.data);
          }
        });
        /* on updateClients
        */
    },



    deleteBubble ({commit}, id) {
      console.log("Delete bubble id: "+id);
      const requestOptions = {
        method: 'DELETE',
        body: JSON.stringify({id: id}),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };
      
      fetch(apiUrl+"/api/deleteData", requestOptions)
        .then(handleResponse).then((res)=> {
	      if(res.success){
	        this._vm.$socket.emit("deletedInDB", id); 
	      }else{
	        console.log(res);
	      }
	    });
	    /*on deleteInClients
	  	*/
    },
    addBubbleToSpace ({commit}, bubble){
      commit('addBubbleToState', bubble)
      commit('putBubble',  {bubble:bubble,startX:0,startY:0})
    },

    updateBubbleInSpace({commit}, bubble){
      commit('updateBubble', bubble)
      commit('putBubble',  {bubble:bubble,startX:0,startY:0})
    }
  },
  modules: {
  }
})

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
