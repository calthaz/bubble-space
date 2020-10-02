let constructBackground = (bubble) => {
    let pleasure = bubble.coord[0]/5;
    let arousal = bubble.coord[1]/5;
    let bg = `linear-gradient(60deg, rgba(242, 255, 38, ${Math.max(0, pleasure)}), `
             +`rgba(224, 251, 0, ${Math.max(0, pleasure)})), `
           +`linear-gradient(240deg, rgba(38, 115, 255, ${Math.max(0, -pleasure)}), `
           +`rgba(0, 100, 251, ${Math.max(0, -pleasure)})), `
           +`linear-gradient(150deg, rgba(255, 38, 38, ${Math.max(0, arousal)}), `
             +`rgba(251, 0, 0, ${Math.max(0, arousal)})), `
           +`linear-gradient(330deg, rgba(51, 255, 38, ${Math.max(0, -arousal)}), `
           +`rgba(39, 251, 0, ${Math.max(0, -arousal)})) `;
  return bg; 
};

let calculateRadius = (bubble) => {
     //var SIZES = [0,1,2,3,4,5,6];
    let r = (Math.abs(bubble.coord[0])+Math.abs(bubble.coord[1]));
  return r===0 ? 0 : (Math.floor((r-1)/2)); 
  //return 3; //some category 
};

let emptyBubble = {
  coord:[0,0], 
  title: '',
  date: '',
  situation: '',
  thoughts: '',
  feelings: '',
  tags: [],
};

export {constructBackground, calculateRadius, emptyBubble}