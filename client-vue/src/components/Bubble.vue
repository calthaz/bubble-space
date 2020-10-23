<template>
  <transition name="float-and-explode">
    <div v-if="bubble.active" class="bubbleWrapper" :style='computedWrapperStyle'>
        <v-btn class="bubble" :style="computedBtnStyle" @click="registerClick">
            <!--{{bubble.coord[0]}}, {{bubble.coord[1]}}, {{bubble.coord[2]}} 
            {{bubble.id}}:{{bubble.pos[0]}},{{bubble.pos[1]}}-->
        </v-btn>
    </div>
  </transition>
</template>

<script>
import {calculateRadius, constructBackground} from '@/bubble/bubbleHelper'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
    name: 'Bubble',
    props: {
        bubble: {
            required: true
        },
    },
    data(){
        return {
            clicked: 0
        }
    },
    computed:{
        ...mapState(['gridSize', 'spaceWidth', 'spaceHeight', 'startDate', 'endDate']),
        r(){
            return calculateRadius(this.bubble);
        },
        width(){
            return ((this.r*2+4)*this.gridSize)
        },
        computedWrapperStyle(){
            //console.log(this.bubble)
            if(this.bubble.pos){
                let top = (this.bubble.pos[1])*this.gridSize-this.width/2//)//;
                let left =  (this.bubble.pos[0])*this.gridSize-this.width/2//)//;
                let zIndex = (this.bubble.id);
                //if(this.clicked==1)
                //    return { top: (top)+'px', left: (left)+"px", zIndex:361}
                //else
                let transitionTime = 0.5; 
                if(this.bubble.date && this.bubble.date!=""){
                    let distance = moment(this.bubble.date, "YYYY-M-D").diff(
                        moment(this.startDate, "YYYY-M-D"), "days")
                    let totalDays = moment(this.endDate, "YYYY-M-D").diff(
                        moment(this.startDate, "YYYY-M-D"), "days")
                    transitionTime += distance/totalDays*2
                }
                
                return { top: (top)+'px', left: (left)+"px", zIndex, transition:`top ${transitionTime}s, left ${transitionTime}s `}
            }else{
                return {position: 'relative'}
            }
            
        },
        computedBtnStyle(){
            let background = constructBackground(this.bubble);
            //console.log(this.r)
      	    let width = this.width +'px';
            let height = this.width +'px';
            //if(this.clicked==1)
            //    return { background, width: width , height: height, 
            //    boxShadow: "0 4px 20px 0px rgba(0, 0, 0, 0.12)"}    
            //else
            return { background, width: width , height: height}    
        }
    },
    methods:{
        registerClick(){
            console.log('bubble clicked: ', this.bubble.id, this.clicked)
            this.$emit('update-bubble', this.bubble)
            /*if (this.clicked==0){
                this.clicked=1
            }else if(this.clicked==1){
                this.click=0
            }else{
                this.click=0
            }*/
        }
    }
}
</script>

<style lang="less" scoped>
  .bubbleWrapper{
    margin: 5px;
    display: inline-block;
    position: absolute;
    top:100%;
    left:0px;
    //transition: all .5s;
    //transition: left .5s;
  }

  .bubble{
  	width: 50px;
    min-width: 0px  !important;
    height: 50px;
	min-width: initial;
    background-blend-mode: multiply;
    border-radius: 50%;
    //box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.12);
    padding: 0px !important;
  }
    .float-and-explode-enter {
        top:100% !important;
        left:0px !important;
    }
    .float-and-explode-enter-active {
       // transition: all .5s;
    }
  .float-and-explode-leave-active {
    animation: explode .5s;
  }

  @keyframes explode {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.5);
        opacity: 0.5;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
  }
      .float-and-explode-leave-to {
     opacity: 0;
    }
</style>