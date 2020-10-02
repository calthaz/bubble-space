<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-toolbar-title>
        bubble space
      </v-toolbar-title>

      <v-spacer></v-spacer>
      
      <v-btn icon @click='handleAddFormOpen'>
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      
      <template v-slot:extension>
        <v-btn icon>
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title>
          September
        </v-toolbar-title>  
        <v-btn icon>
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-calendar</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <BubbleSpace v-if='showSpace' :show-list="showList"/>
      <BubbleList v-if='showList' @update-bubble="openUpdateBubbleDialog"/>
      <BubbleDialog :dialog="showAddDialog" :bubble='emptyBubble'
        :handleSuperFormClose='handleAddFormClose'
        :action='addBubbleFromDialog'
        :actionName="'Add'"
        :title="'Blow you mood bubble'" />
      <BubbleDialog :dialog="showUpdateDialog" :bubble='bubbleToBeUpdated'
        :handleSuperFormClose='handleUpdateFormClose'
        :action='updateBubbleFromDialog'
        :actionName="'Update'"
        :action2='deleteBubbleFromDialog'
        :actionName2="'Delete'"
        :title="'Update or delete bubble'" />
    </v-main>
  </v-app>
</template>

<script>
import BubbleSpace from './components/BubbleSpace';
import BubbleList from './components/BubbleList';
import BubbleDialog from './components/BubbleDialog';
import {emptyBubble} from '@/bubble/bubbleHelper'

export default {
  name: 'App',

  components: {
    BubbleSpace,
    BubbleList,
    BubbleDialog,
  },

  data: () => ({
    showList: true,
    showSpace: true,
    showAddDialog: false,
    showUpdateDialog: false,
    emptyBubble: emptyBubble,
    bubbleToBeUpdated: emptyBubble
  }),
  
  mounted(){
    this.$store.dispatch('synchronizeWithDBandLS')
    if(window.innerWidth < 500) {
        this.showSpace = false;
        //w = Math.floor(500/this.state.gridSize);        
    //this.setState({ spaceWidth, spaceHeight});
    } else {
        this.showSpace = true;
    }
  },
  methods:{
      handleAddFormOpen: function(event){
        this.showAddDialog=true;
        this.showUpdateDialog=false;
      },

      handleAddFormClose: function(value){
        this.showAddDialog=false;
        this.showUpdateDialog=false;
      },
      handleUpdateFormClose(){
        this.showAddDialog=false;
        this.showUpdateDialog=false;
      },

      addBubbleFromDialog: function(bubble){
        this.$store.dispatch('addBubble', bubble)
      },

      openUpdateBubbleDialog(bubble){
        this.bubbleToBeUpdated = bubble;
        this.showAddDialog=false;
        this.showUpdateDialog=true;
      }
  }

};
</script>
