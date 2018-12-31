var moodPlaneParser = Array(11).fill().map(() => Array(11).fill(0));
var csv = [["","defeated","helpless","powerless","exhausted","paralyzed","","","content","","fufilled"],
["","depressed","","","","","grounded","","","",""],
["","","discouraged","","fatigue","lazy","relaxed","calm","","satisfied",""],
["","aching","","hurt","tired","bored","","","thankful","",""],
["","heartbroken","","","","","","","","",""],
["grieving","","sad","","unhappy","neutral","","glad","happy","",""],
["","","","uneasy","","balanced","kind","","","",""],
["","afraid","irratated","","","","open-minded","","","",""],
["angry","","frustrated","nervous","","","","anticipating","ready","",""],
["disgusted","frightened","annoyed","","impatient","","excited","","","enthusiastic",""],
["furious","panic","agitated","anxious","restless","","","","strong","","matchless"]];
for (let a = 0; a < csv.length; a++) {
	for (let p = 0; p < csv[a].length; p++) {
		if (csv[a][p] !== ""){
			moodPlaneParser[p][a] = csv[a][p];
		}else{
			moodPlaneParser[p][a] = (p-5)+", "+(a-5); 
		}
		
	}
}

module.exports = moodPlaneParser; 