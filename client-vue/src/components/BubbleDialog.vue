<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{title}}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form
              ref="form"
              v-model="valid"
              lazy-validation
            >
            <v-row>
              <v-col cols='12'>
                {{(buffer.title||"Untitled")}}, [{{buffer.coord[0]}}, {{buffer.coord[1]}}]<br/>
                {{buffer.situation}}
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Title" v-model='buffer.title'
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Date" v-model='buffer.date'
                  :rules="[validateDate]"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                
              >
                <v-slider
                  label="Pleasure*"
                  v-model="buffer.coord[0]"
                  :max="5" :min="-5"
                  ticks step='1' thumb-label
                  required
                />
              </v-col>
              <v-col
                cols="12">
                <v-slider
                  label="Arousal*"
                  v-model="buffer.coord[1]"
                  :max="5" :min="-5"
                  ticks step='1' thumb-label
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Situation"
                  v-model="buffer.situation"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Thoughts"
                  v-model="buffer.thoughts"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Feelings"
                  v-model="buffer.feelings"
                ></v-text-field>
              </v-col>
            </v-row>
            </v-form>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="amber darken-1"
            text
            @click="() => this.handleFormClose('cancel')"
          >
            Cancel
          </v-btn>
          <v-btn
            v-if='action2'
            color="red darken-1"
            text
            @click="() => this.handleFormClose(actionName2)"
          >
            {{actionName2}}
          </v-btn>
          <v-btn
            v-if='action'
            color="blue darken-1"
            text
            @click="() => this.handleFormClose(actionName)"
          >
            {{actionName}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import moment from 'moment'
//import { mapState, mapActions, mapMutations } from 'vuex'
//import {calculateRadius, constructBackground} from '@/bubble/bubbleHelper'
export default {
    name: "BubbleDialog",
    data: () => ({
        buffer: {coord:[0, 0]},
        valid: true,
        //dateRules: [validateDate],
    }),
    props: {
        dialog: {type: Boolean, required: true},
        bubble: {type: Object, required: true},
        handleSuperFormClose: {type: Function, required: true},
        action: Function,
        actionName:String,
        action2: Function,
        actionName2: String,
        title: {type: String, required: true},
    },
    mounted(){
      
        this.buffer = JSON.parse(JSON.stringify(this.bubble))
    },
    watch: { 
      	bubble: function(newVal, oldVal) { // watch it
          console.log('Prop changed: ', newVal, ' | was: ', oldVal)
          this.buffer = JSON.parse(JSON.stringify(this.bubble))
        }
    },
    methods:{
        validateDate: function(value){
          if (!value) return true;
          if(moment(value, 'YYYY-M-D', true).isValid()){
            return true
          }else{
            return "Please follow the format YYYY-M-D. "
          }
        },

        handleFormClose : function(value){
            //update depth exceeded?
            //console.log(value); //1000 undefined Navigation.js:66 
            //Maximum update depth exceeded. This can happen 
            //when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. 
            //React limits the number of nested updates to prevent infinite loops.
            if(value==="cancel"){
                //msg: cancelled
                this.buffer = JSON.parse(JSON.stringify(this.bubble))
            }else if(value===this.actionName){
                //check required fields
                let isValid = this.$refs.form.validate()
                console.log("about to action in dialog", this.buffer)
                if(isValid){
                  this.action(this.buffer);	
                }
                  		
            }else if(value===this.actionName2){
                //check required fields
                console.log("trying to delete: "+this.buffer.id)
                this.action2(this.buffer.id);	  		
            }
            this.handleSuperFormClose();
  	    },
    }
}
</script>