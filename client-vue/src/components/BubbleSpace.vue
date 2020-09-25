<template>
    <div id = "space" :style='"width:"+(gridSize*spaceWidth)+"px; height:"+(gridSize*spaceHeight)+"px"'>
        <Bubble v-for='b in bubbles' :key='b.id' :bubble='b'/>
    </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import Bubble from "@/components/Bubble.vue"

export default {
    name: 'BubbleSpace',
    components:{
        Bubble

    },
    computed: {
        ...mapState(['bubbles', 'spaceWidth', 'spaceHeight', 'gridSize']),

    },
    methods: {
        ...mapActions(['addBubbleToSpace', 'updateBubbleInSpace']),
        ...mapMutations(['deleteBubbleInSpace', 'updateSpaceDimensions']),
        updateDimensionsAsWindowResizes: (self)=> {//??? why ???
            //return; //todo 
            console.log("updateDimensionsAsWindowResizes");
            let w = Math.round((window.innerWidth)/self.gridSize);
            //this.setState({ spaceWidth, spaceHeight });
            self.updateSpaceDimensions({width: w, height: self.spaceHeight});
            //
        }
    },
    sockets:{
        connect: function () {
            console.log('socket connected')
        },
        disconnect: function () {
            console.log('socket disconnected')
        },
        connect_error: function(error){
            console.log('Connect error! ' + error);
        },
        connect_timeout:  function (error){
            console.log('Connect timeout! ' + error);
        },
        error: function(error) {
            console.log('Error! ' + error);
        },
        addToClients: function(bubble){
            console.log("[socket.on] addToClients", bubble)
            this.addBubbleToSpace(bubble)
	    },
	    updateClients: function(bubble){
            console.log("[socket.on] updateClients", bubble)
	    	this.updateBubbleInSpace(bubble)
	    },
	    deleteInClients: function(id){
            console.log("[socket.on] deleteInClients", id)
            this.deleteBubbleInSpace(id)
	    }
    },
    created() {
        window.addEventListener("resize", ()=>{this.updateDimensionsAsWindowResizes(this)});
    },
    destroyed() {
        window.removeEventListener("resize", ()=>{this.updateDimensionsAsWindowResizes(this)});
    },
    mounted(){
        this.updateDimensionsAsWindowResizes(this)
    }
}
</script>

<style scoped>

</style>