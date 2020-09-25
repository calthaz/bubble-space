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
      
      <v-btn icon>
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
      
      <BubbleSpace v-if='showSpace' />
      <!--<v-if='showList' BubbleList/>-->
    </v-main>
  </v-app>
</template>

<script>
import BubbleSpace from './components/BubbleSpace';
//import BubbleList from './components/BubbleList';

export default {
  name: 'App',

  components: {
    BubbleSpace,
    //BubbleList
  },

  data: () => ({
    showList: true,
    showSpace: true
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
  }
};
</script>
