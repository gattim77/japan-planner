import type {City} from './catalog.ts';
/** Rail-connected overnight bases. Coordinates identify the central station;
 * festival locations retain their own source coordinates. */
export const additionalDestinations:City[]=[
{id:'nara',name:'Nara',ja:'奈良',prefecture:29,region:'Kansai',lat:34.6807,lng:135.8189,description:'Temple and shrine traditions in Japan’s early capital.',source:'https://www.visitnara.jp/',tags:['culture','classic'],attractions:['Tōdai-ji','Kasuga Taisha'],nights:2},
{id:'nagoya',name:'Nagoya',ja:'名古屋',prefecture:23,region:'Chubu',lat:35.1709,lng:136.8815,description:'A central rail hub with access to Aichi’s shrine traditions.',source:'https://www.nagoya-info.jp/en/',tags:['culture','food'],attractions:['Nagoya Castle','Atsuta Jingū'],nights:2},
{id:'sendai',name:'Sendai',ja:'仙台',prefecture:4,region:'Tohoku',lat:38.2602,lng:140.8824,description:'A northern regional base with nearby Shiogama shrine traditions.',source:'https://discoversendai.travel/',tags:['culture','food'],attractions:['Zuihōden','Sendai Castle site'],nights:2},
{id:'hachinohe',name:'Hachinohe',ja:'八戸',prefecture:2,region:'Tohoku',lat:40.5094,lng:141.4316,description:'A coastal city known for Enburi and local festival traditions.',source:'https://visithachinohe.com/en/',tags:['culture','hidden'],attractions:['Hasshoku Center','Kabushima'],nights:2},
{id:'wakayama',name:'Wakayama',ja:'和歌山',prefecture:30,region:'Kansai',lat:34.2322,lng:135.1914,description:'Castle-town heritage and nearby coastal shrine festivals.',source:'https://www.wakayamakanko.com/eng/',tags:['culture','hidden'],attractions:['Wakayama Castle'],nights:2},
{id:'okayama',name:'Okayama',ja:'岡山',prefecture:33,region:'Chugoku',lat:34.6653,lng:133.9175,description:'A Sanyo rail hub with gardens and Saidaiji’s festival traditions.',source:'https://www.okayama-japan.jp/en/',tags:['culture','classic'],attractions:['Kōrakuen','Okayama Castle'],nights:2},
{id:'kumamoto',name:'Kumamoto',ja:'熊本',prefecture:43,region:'Kyushu',lat:32.7898,lng:130.6887,description:'A Kyushu rail base with castle heritage and local rituals.',source:'https://kumamoto-guide.jp/en/',tags:['culture','food'],attractions:['Kumamoto Castle','Suizenji Garden'],nights:2},
{id:'chiba',name:'Chiba',ja:'千葉',prefecture:12,region:'Kanto',lat:35.6133,lng:140.1133,description:'A Tokyo Bay rail base for nearby Chiba festival venues.',source:'https://www.chibacity-ta.or.jp/en/',tags:['culture','hidden'],attractions:['Chiba Shrine'],nights:2},
];
