<template>
    <div class="bubbleWrapper" :style='computedWrapperStyle'>
        <v-btn class="bubble" :style="computedBtnStyle">
            {{bubble.pos[0]}}, {{bubble.pos[1]}}
        </v-btn>
    </div>
</template>

<script>
import {calculateRadius, constructBackground} from '@/bubble/bubbleHelper'
import { mapState } from 'vuex'
export default {
    name: 'Bubble',
    props: {
        bubble: {
            required: true
        },
    },
    computed:{
        ...mapState(['gridSize']),
        r(){
            return calculateRadius(this.bubble);
        },
        width(){
            return ((this.r*2+4)*this.gridSize)
        },
        computedWrapperStyle(){
            console.log(this.bubble)
            if(this.bubble.pos){
                let top = (this.bubble.pos[1]-this.r)*this.gridSize//)//;
                let left =  (this.bubble.pos[0]-this.r)*this.gridSize//)//;
                let zIndex = (this.bubble.id);
                return { top: (top)+'px', left: (left)+"px", zIndex}
            }else{
                return {position: 'relative'}
            }
            
        },
        computedBtnStyle(){
            let background = constructBackground(this.bubble);
            //console.log(this.r)
      	    let width = this.width +'px';
            let height = this.width +'px';
            return { background, width: width , height: height}        
        }
    }
}
</script>

<style scoped>
  .bubbleWrapper{
    margin: 5px;
    display: inline-block;
    position: absolute;
  }

  .bubble{
  	width: 50px;
    min-width: 0px  !important;
    height: 50px;
	min-width: initial;
    background-blend-mode: multiply;
    border-radius: 50%;
    box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.12);
    padding: 0px !important;
  }
</style>