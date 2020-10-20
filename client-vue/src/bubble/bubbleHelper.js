let constructBackground = (bubble) => {
    let pleasure = bubble.coord[0]/5;
    let arousal = bubble.coord[1]/5;
    let dominance = bubble.coord[2]/5;
    let bg = `linear-gradient(60deg, rgba(242, 255, 38, ${Math.max(0, pleasure)}), `
             +`rgba(224, 251, 0, ${Math.max(0, pleasure)})), `
           +`linear-gradient(240deg, rgba(38, 115, 255, ${Math.max(0, -pleasure)}), `
           +`rgba(0, 100, 251, ${Math.max(0, -pleasure)})), `
           +`linear-gradient(120deg, rgba(255, 38, 38, ${Math.max(0, arousal)}), `
             +`rgba(251, 0, 0, ${Math.max(0, arousal)})), `
           +`linear-gradient(300deg, rgba(51, 255, 38, ${Math.max(0, -arousal)}), `
           +`rgba(39, 251, 0, ${Math.max(0, -arousal)})), `
           +`linear-gradient(180deg, rgba(247, 38, 251, ${Math.max(0, dominance)}), `
           +`rgba(247, 0, 251, ${Math.max(0, dominance)})), `
            +`linear-gradient(360deg, rgba(242, 255, 38, ${Math.max(0, -dominance)}), `
            +`rgba(242, 255, 3, ${Math.max(0, -dominance)})) `;
    //console.log(bg)
  return bg; 
};

let calculateRadius = (bubble) => {
     //var SIZES = [0,1,2,3,4,5,6];
    let r = (Math.abs(bubble.coord[0])+Math.abs(bubble.coord[1])+Math.abs(bubble.coord[2]))/3*2;
  return r===0 ? 0 : (Math.floor((r-1)/2)); 
  //return 3; //some category 
};

let emptyBubble = {
  coord:[0,0, 0], 
  title: '',
  date: '',
  situation: '',
  thoughts: '',
  feelings: '',
  tags: [],
};

export {constructBackground, calculateRadius, emptyBubble}