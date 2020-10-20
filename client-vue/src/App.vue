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
        <v-btn icon @click="setEarlierPeriod">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{dateRange}}
        </v-toolbar-title>  
        <v-btn icon @click="setLaterPeriod">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn icon @click="openDateDialog">
          <v-icon>mdi-calendar</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-dialog
        v-model="showDateDialog"
        persistent
        max-width="600px"
      >
      <v-card>
        <v-card-title>
          <span class="headline">Set start date and end date (exclusive)</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="dateForm" v-model='validRange' lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Start Date" v-model='tempStartDate'
                  :rules="[validateDate, validateRange]"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="End Date" v-model='tempEndDate'
                  :rules="[validateDate, validateRange]"
                ></v-text-field>
              </v-col>
            </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="amber darken-1"
            text
            @click="() => this.handleDateFormClose('cancel')"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="() => this.handleDateFormClose('save')"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
      </v-dialog>

      <BubbleSpace v-if='showSpace' :show-list="showList" @update-bubble="openUpdateBubbleDialog"/>
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
import {emptyBubble} from '@/bubble/bubbleHelper';
import moment from 'moment';
import { mapState } from 'vuex';

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
    showDateDialog: false,
    emptyBubble: emptyBubble,
    bubbleToBeUpdated: emptyBubble,
    tempStartDate: undefined,
    tempEndDate: undefined,
    validRange: true,
  }),
  computed: {
    ...mapState(['startDate', 'endDate']),
    dateRange(){
      return this.startDate+" - "+this.endDate
    }
  },
  mounted(){
    this.$store.dispatch('synchronizeWithDBandLS')
    if(window.innerWidth < 500) {
        this.showSpace = false;
        //w = Math.floor(500/this.state.gridSize);        
    //this.setState({ spaceWidth, spaceHeight});
    } else {
        this.showSpace = true;
    }
    this.tempStartDate = this.startDate;
    this.tempEndDate = this.endDate;
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
        console.log("openUpdateBubbleDialog", bubble)
        this.bubbleToBeUpdated = bubble;
        this.showAddDialog=false;
        this.showUpdateDialog=true;
      },

      updateBubbleFromDialog(bubble){
        console.log("updateBubbleFromDialog", bubble)
        this.$store.dispatch('updateBubble', bubble)
      },

      deleteBubbleFromDialog(id){
        this.$store.dispatch('deleteBubble', id)
      },

      openDateDialog(){
        this.showDateDialog=true;
      },

      validateDate: function(value){
        if (!value) return "start and end dates are required";
        if(moment(value, 'YYYY-M-D').isValid()){
          return true
        }else{
          return "Please follow the format YYYY-M-D. "
        }
      },

      validateRange: function(){
        if(moment(this.tempEndDate).isSameOrBefore(this.tempStartDate)){
            this.validRange = false;
            return "Start date must come before end date."
          }else{
            return true
          }
      },

      handleDateFormClose: function(value){
        if(value=='cancel'){
          this.tempStartDate = this.startDate;
          this.tempEndDate = this.endDate;
          this.showDateDialog = false;
          this.validRange = true;
        }else{
          if(!this.$refs.dateForm.validate()){
            this.validRange = false;
          }else{
            this.$store.state.endDate = this.tempEndDate
            this.$store.state.startDate = this.tempStartDate
            this.showDateDialog = false;
            this.validRange = true;
            this.$store.dispatch('relocateAllBubbles')
          }
        }
      },

      setEarlierPeriod: function(){
        let oldStartDate = this.tempStartDate;
        let oldEndDate = this.tempEndDate;
        let count = (this.tempStartDate.match(/-/g) || []).length;
        console.log(count)
        let newStartDate = this.tempStartDate
        let newEndDate = this.tempEndDate
        if(count==0){
          newStartDate = moment(this.tempStartDate, "YYYY").subtract(1, 'year').format('YYYY')
          newEndDate = moment(this.tempEndDate, "YYYY").subtract(1, 'year').format('YYYY')
        }else if(count==1){
          newStartDate = moment(this.tempStartDate, "YYYY-M").subtract(1, 'month').format('YYYY-M')
          newEndDate = moment(this.tempEndDate, "YYYY-M").subtract(1, 'month').format('YYYY-M')
        }else{
          newStartDate = moment(this.tempStartDate, "YYYY-M-D").subtract(1, 'day').format('YYYY-M-D')
          newEndDate = moment(this.tempEndDate, "YYYY-M-D").subtract(1, 'day').format('YYYY-M-D')
        }
        console.log(newStartDate, newEndDate)
        this.tempStartDate = newStartDate;
        this.tempEndDate = newEndDate;
        if(this.validateRange){
          this.$store.state.startDate = this.tempStartDate
          this.$store.state.endDate = this.tempEndDate
          this.$store.dispatch('relocateAllBubbles')
        }else{
          this.$store.state.startDate = oldStartDate
          this.$store.state.endDate = oldEndDate
        }
      },

      setLaterPeriod: function(){
        let oldStartDate = this.tempStartDate;
        let oldEndDate = this.tempEndDate;
        let count = (this.tempEndDate.match(/-/g) || []).length;
        console.log(count)
        let newStartDate = this.tempStartDate
        let newEndDate = this.tempEndDate
        if(count==0){
          newStartDate = moment(this.tempStartDate, "YYYY").add(1, 'year').format('YYYY')
          newEndDate = moment(this.tempEndDate, "YYYY").add(1, 'year').format('YYYY')
        }else if(count==1){
          newStartDate = moment(this.tempStartDate, "YYYY-M").add(1, 'month').format('YYYY-M')
          newEndDate = moment(this.tempEndDate, "YYYY-M").add(1, 'month').format('YYYY-M')
        }else{
          newStartDate = moment(this.tempStartDate, "YYYY-M-D").add(1, 'day').format('YYYY-M-D')
          newEndDate = moment(this.tempEndDate, "YYYY-M-D").add(1, 'day').format('YYYY-M-D')
        }
        console.log(newStartDate, newEndDate)
        this.tempStartDate = newStartDate;
        this.tempEndDate = newEndDate;
        if(this.validateRange){
          this.$store.state.startDate = this.tempStartDate
          this.$store.state.endDate = this.tempEndDate
          this.$store.dispatch('relocateAllBubbles')
        }else{
          this.$store.state.startDate = oldStartDate
          this.$store.state.endDate = oldEndDate
        }
      }

  }

};
</script>
