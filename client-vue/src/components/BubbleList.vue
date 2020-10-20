<template>
    <v-list id = 'bubble-list' three-line>
      <template v-for="(item) in bubbles" >
        <v-list-item
          :key="item.id"
          @click="()=>registerClick(item)"
        >
          <v-list-item-avatar>
            <div :style="item.style"></div>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-if="item.title">{{item.title}}</v-list-item-title>
            <v-list-item-title v-if="!item.title">Untitled</v-list-item-title>
            <v-list-item-subtitle>[{{item.coord[0]}}, {{item.coord[1]}}], 
                {{item.situation}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import {calculateRadius, constructBackground} from '@/bubble/bubbleHelper'

export default {
    name: 'BubbleList',
    computed: {
        //...mapState(['bubbles']),
        bubbles(){
            return this.$store.state.bubbles.map((b)=>{
                b.style = {width: (calculateRadius(b)*10+5)+"px",
                height: (calculateRadius(b)*10+5)+"px",
                background: constructBackground(b)}
                return b
            })
        }
    },
    methods:{
        registerClick(bubble){
            console.log('bubble list clicked: ', bubble.id)
            console.log("emit update-bubble", bubble)
            this.$emit('update-bubble', bubble)
        }
    }
}
</script>
<style lang='less' scoped>
#bubble-list{
    position: absolute;
    top:5px;
    right:0px;
    width:300px;
}
</style>