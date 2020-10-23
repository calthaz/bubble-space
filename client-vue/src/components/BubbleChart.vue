<template>
  <div id = "chart">   
      <h3>Mood trends</h3>
      <LineChart :data="bubbleData" :styles="styles"/>
  </div>
</template>

<script>
import LineChart from "./LineChart"
import moment from 'moment'
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
  name: "App",
    components: {
        LineChart
    },
    data(){
        return {
            
        }
    },
    computed: {
        ...mapState(['startDate', "endDate", 'spaceWidth', 'spaceHeight', 'gridSize']),
        styles() {
                return{
                    width: (this.gridSize*this.spaceWidth-20)+"px",
                    height: "250px",
                    position: "relative"
                }
        },
        bubbleData(){
            let activeBubbles = this.$store.state.bubbles.filter((b)=>{
                if(b.date==""){
                    return b
                }
                //console.log(b.date)
                if(moment(b.date, "YYYY-M-D").isBetween(this.startDate, this.endDate, null, '[)')){
                    return b
                } 
            })

            if (activeBubbles.length==0){
                return {};
            }

            activeBubbles.sort((a, b)=>{
                let bLessThanA = moment(b.date, "YYYY-M-D").isSameOrBefore(moment(a.date, "YYYY-M-D"))
                console.log(b.date, bLessThanA, a.date)
                if(bLessThanA) {
                    return 1
                }else{
                    return -1
                }
            })

            console.log(activeBubbles)

            activeBubbles = activeBubbles.map((b, i)=>{
                let distance = moment(b.date, "YYYY-M-D").diff(moment(this.startDate, "YYYY-M-D"), "days")
                return {coord: b.coord, x: distance, id:b.id}
            })

            console.log(activeBubbles)

            let count = 0;
            let start = 0;
            let current = activeBubbles[0].x;
            for (let i = 1; i<activeBubbles.length; i++){
                if(current == activeBubbles[i].x){
                    count ++;
                }else{
                    for(let j = start; j<=start+count; j++){
                        activeBubbles[j].x+=(j-start)/(count+1);
                    }
                    current = activeBubbles[i].x;
                    start = i;
                    count = 0;
                }
            }
            for(let j = start; j<=start+count; j++){
                console.log(j)
                activeBubbles[j].x+=(j-start)/(count+1);
            }

            console.log(activeBubbles)
            return activeBubbles
        }
    },
};
</script>
<style scoped>
#chart h3{
    padding:10px;
}
</style>