var moodPlaneParser = Array(11).fill().map(() => Array(11).fill(0));
var csv = [["","defeated","helpless","powerless","exhausted","","","","content","","fufilled"],
["","depressed","","","","lazy","grounded","","","",""],
["","","discouraged","","fatigue","","relaxed","calm","","satisfied",""],
["","aching","","hurt","tired","bored","","","thankful","",""],
["","heartbroken","","","","","","","","",""],
["grieving","","sad","","unhappy","neutral","","glad","happy","",""],
["","","","nervous","","balanced","kind","","","",""],
["","","","irratated","uneasy","","open-minded","","","",""],
["","angry","frustrated","","","","","anticipating","ready","",""],
["","disgusted","","annoyed","impatient","","excited","","","enthusiastic",""],
["furious","","agitated","","restless","","","","strong","","matchless"]];
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