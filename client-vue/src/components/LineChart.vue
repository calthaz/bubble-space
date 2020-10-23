<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  name: "LineChart",
  props: ["data"],
  watch: { 
      	data: function(newVal, oldVal) { // watch it
          console.log('Prop changed: ', newVal, ' | was: ', oldVal)
          this.plotChart()
        }
  },
    methods:{
        plotChart(){
          let chartData = {
            //labels: [],
            datasets: [
                {
                label: "Pleasure",
                borderColor: "#f87979",
                fill:false,
                data: [],
                cubicInterpolationMode: 'linear',
                lineTension: 0.1,
                },
                {
                label: "Arousal",
                borderColor: "#79f879",
                fill:false,
                data: [],
                cubicInterpolationMode: 'linear',
                lineTension: 0.1,
                },
                {
                label: "Dominance",
                borderColor: "#7979f8",
                fill: false,
                data: [],
                cubicInterpolationMode: 'linear',
                lineTension: 0.1,
                }
            ]
          };

            for (let i = 0; i < this.data.length; i++) {
                //chartData.labels.push(i.toString());//this.data[i].x
                chartData.datasets[0].data.push({x:this.data[i].x, y:this.data[i].coord[0]});
                chartData.datasets[1].data.push({x:this.data[i].x, y:this.data[i].coord[1]});
                chartData.datasets[2].data.push({x:this.data[i].x, y:this.data[i].coord[2]});
            }

            this.renderChart(chartData, {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        type: 'linear',
                        scaleLabel: {
                          display: true,
                          labelString: 'Days From Start Date'
                        }
                    }]
                }
    
            });
        }
    },
  mounted() {
    // reformat in the way the lib wants
    this.plotChart();
  }
};
</script>