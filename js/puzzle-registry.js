/* Centrale registratie van puzzelsoorten.
   Nieuwe puzzels beginnen hier, maar worden pas zichtbaar zodra active:true staat.
   Puzzelspecifieke spelcode blijft bewust in de eigen modules. */
const PUZZLE_REGISTRY={
 bin:{name:"Binair",active:true,defaultFavorite:true,dailyLevels:{easy:{wide:1,phone:4},normal:{wide:2,phone:5},hard:{wide:3,phone:6}},color:"#7a52d6",levels:{wide:[1,2,3],phone:[4,5,6]},sizes:{1:"10×14",2:"14×18",3:"16×22",4:"6×8",5:"8×10",6:"10×14"}},
 star:{name:"Star Battle",active:true,defaultFavorite:true,dailyLevels:{easy:{wide:1,phone:4},normal:{wide:2,phone:5},hard:{wide:3,phone:6}},color:"#c97a00",levels:{wide:[1,2,3],phone:[4,5,6]},sizes:{1:"8×8 · 1★",2:"9×9 · 2★",3:"10×10 · 2★",4:"7×7 · 1★",5:"8×8 · 2★",6:"9×9 · 2★"}},
 nono:{name:"Nonogram",active:true,defaultFavorite:true,dailyLevels:{easy:{wide:1,phone:4},normal:{wide:2,phone:5},hard:{wide:3,phone:6}},color:"#0f9d8c",levels:{wide:[1,2,3],phone:[4,5,6]},sizes:{1:"8×5",2:"15×10",3:"20×14",4:"5×8",5:"8×12",6:"10×15"}},
 kak:{name:"Kakuro",active:false,color:"#e0486b"},
 hex:{name:"Hexcells",active:true,defaultFavorite:false,dailyLevels:{easy:{wide:1,phone:4},normal:{wide:2,phone:5},hard:{wide:3,phone:6}},color:"#e8590c",levels:{wide:[1,2,3],phone:[4,5,6]},sizes:{1:"klein",2:"middel",3:"pittig",4:"klein",5:"middel",6:"pittig"}},
 plus:{name:"Pluszle",active:true,defaultFavorite:false,dailyLevels:{easy:{wide:1,phone:4},normal:{wide:2,phone:5},hard:{wide:3,phone:6}},color:"#2b7bd6",levels:{wide:[1,2,3],phone:[4,5,6]},sizes:{1:"5×5",2:"6×6",3:"7×7 · vlakken",4:"5×5",5:"6×6",6:"6×7 · vlakken"}},
 mur:{name:"Murdoku",active:true,defaultFavorite:false,dailyLevels:{easy:{wide:1,phone:4},normal:{wide:2,phone:5},hard:{wide:3,phone:6}},color:"#b5483a",levels:{wide:[1,2,3],phone:[4,5,6]},sizes:{1:"6×6",2:"7×7",3:"8×8",4:"5×5",5:"6×6",6:"7×7"}},
 m24:{name:"Maak 24",active:false,color:"#2f9e44"}
};

window.PUZZLE_REGISTRY=PUZZLE_REGISTRY;
