/* વેલ્ડિંગ કોર્સ — તકનીકી પ્રશ્ન બેંક
   must = ફરજિયાત સલામતીના મુદ્દા. ચૂકી જાય તો ચેતવણી અને કુલ ગુણ મર્યાદિત. */
registerCourse({
  id: "welding",
  name: "વેલ્ડિંગ",
  icon: "🔥",
  tagline: "આર્ક, MIG, TIG અને વેલ્ડિંગ સલામતી",
  mode: "technical",
  questions: [
{
  id: 1,
  cat: "સલામતી",
  q: "What safety equipment do you use while welding, and why?",
  kw: [["apron", "leather", "jacket", "sleeve", "cloth", "cotton"], ["shoes", "safety shoes", "boot", "leg guard"], ["spark", "spatter", "burn", "hot", "metal", "skin", "eye", "flash", "arc eye"], ["fume", "smoke", "gas", "ventilation", "exhaust", "respirator", "mask", "breathing"], ["fire", "extinguisher", "inflammable", "flammable", "away", "clear"]],
  must: [
    { kw: ["helmet", "welding helmet", "shield", "face shield", "screen", "goggles", "glass", "filter", "hood"], gu: "વેલ્ડિંગ હેલ્મેટ / ફેસ શીલ્ડ" },
    { kw: ["gloves", "hand glove", "leather glove", "welding glove"], gu: "લેધર ગ્લવ્ઝ" }
  ],
  gu: "વેલ્ડિંગ કરતી વખતે હું વેલ્ડિંગ હેલ્મેટ કે ફેસ શીલ્ડ પહેરું છું, જેમાં યોગ્ય નંબરનો ડાર્ક ફિલ્ટર ગ્લાસ હોય — તેના વગર આર્કનો પ્રકાશ આંખો બાળે અને «આર્ક આઇ» થાય. લેધર ગ્લવ્ઝ પહેરું છું, જેથી ગરમ ધાતુ અને સ્પાર્કથી હાથ બચે. લેધર એપ્રન કે જૅકેટ અને લાંબી બાંયનાં સુતરાઉ કપડાં પહેરું છું — સિન્થેટિક કપડાં પહેરતો નથી, કારણ કે તે ઓગળીને ચામડીને ચીટકે. સેફ્ટી શૂઝ અને લેગ ગાર્ડ પહેરું છું. વેલ્ડિંગનો ધુમાડો ઝેરી હોય, તેથી હવાની આવ-જા હોય એવી જગ્યાએ કે એક્ઝોસ્ટ સાથે કામ કરું છું અને જરૂર પડે તો રેસ્પિરેટર વાપરું છું. કામની જગ્યાએથી બળી શકે એવી વસ્તુઓ દૂર કરું છું અને ફાયર એક્સ્ટિંગ્વિશર પાસે રાખું છું.",
  en: "While welding I wear a welding helmet or face shield with the correct shade of dark filter glass, because without it the arc light burns the eyes and causes arc eye. I wear leather gloves to protect my hands from hot metal and spatter. I wear a leather apron or jacket and full sleeve cotton clothes, and I never wear synthetic clothes because they melt and stick to the skin. I wear safety shoes and leg guards. Welding fumes are poisonous, so I work in a well ventilated area or with an exhaust, and I use a respirator when needed. I remove all flammable material from the work area and keep a fire extinguisher nearby.",
  tip: "«હેલ્મેટ» અને «લેધર ગ્લવ્ઝ» ચૂકી ગયા તો સીધા નકારાય છે. «સિન્થેટિક કપડાં ન પહેરવાં» ઉમેરવાથી ખરી તાલીમ દેખાય છે."
},
{
  id: 2,
  cat: "મૂળભૂત",
  q: "What is arc welding and how does it join two metals?",
  kw: [["arc", "electric arc", "spark"], ["electrode", "rod", "filler", "wire"], ["heat", "temperature", "hot", "melt", "melts", "molten", "fuse", "fusion"], ["current", "electricity", "power", "machine", "earth", "clamp", "circuit"], ["cool", "cools", "solid", "joint", "weld", "bead", "strong", "flux", "slag"]],
  gu: "આર્ક વેલ્ડિંગમાં ઇલેક્ટ્રોડ અને જોબ વચ્ચે વીજળીની આર્ક એટલે ચિનગારી પેદા કરવામાં આવે છે. વેલ્ડિંગ મશીનનો એક છેડો જોબ સાથે અર્થ ક્લેમ્પથી જોડાય અને બીજો છેડો ઇલેક્ટ્રોડ હોલ્ડરમાં હોય. ઇલેક્ટ્રોડ જોબની નજીક લાવતાં આર્ક બને છે, જેનું તાપમાન આશરે ૩૫૦૦ ડિગ્રી સેલ્સિયસ સુધી પહોંચે છે. એ ગરમીથી જોબની ધાર અને ઇલેક્ટ્રોડ બંને પીગળે છે અને પીગળેલી ધાતુ ભેગી થઈ જાય છે. ઠંડું પડતાં એ ધાતુ જામી જાય અને બે ટુકડા એક બની જાય. ઇલેક્ટ્રોડ પરનું ફ્લક્સ બળીને ગૅસ અને સ્લેગ બનાવે છે, જે પીગળેલી ધાતુને હવાથી બચાવે છે — તેથી વેલ્ડ મજબૂત રહે.",
  en: "In arc welding an electric arc is created between the electrode and the job. One side of the welding machine is connected to the job with an earth clamp, and the other side goes to the electrode holder. When the electrode is brought close to the job an arc forms, and its temperature reaches about three thousand five hundred degrees Celsius. That heat melts both the edge of the job and the electrode, and the molten metal mixes together. When it cools down the metal solidifies and the two pieces become one. The flux on the electrode burns and forms gas and slag, which protect the molten metal from the air, so the weld stays strong.",
  tip: "«ફ્લક્સ પીગળેલી ધાતુને હવાથી બચાવે છે» — આ મુદ્દો બોલવાથી ઊંડી સમજ દેખાય છે."
},
{
  id: 3,
  cat: "વેલ્ડિંગ પ્રકાર",
  q: "What is the difference between MIG welding and TIG welding?",
  kw: [["mig", "metal inert gas", "gmaw"], ["tig", "tungsten inert gas", "gtaw"], ["wire", "continuous", "feed", "consumable", "automatic"], ["tungsten", "non consumable", "non-consumable", "separate", "filler rod", "hand"], ["fast", "faster", "thick", "production", "slow", "slower", "thin", "clean", "neat", "quality", "finish", "stainless", "aluminium", "aluminum"]],
  gu: "MIG એટલે Metal Inert Gas વેલ્ડિંગ. તેમાં વાયર જાતે સતત આગળ ધકેલાય છે અને એ વાયર જ ફિલર બની જાય છે, અને સાથે શીલ્ડિંગ ગૅસ આવે છે. તેથી MIG ઝડપી છે અને જાડી પ્લેટ તથા મોટા પ્રોડક્શન કામ માટે સારું છે. TIG એટલે Tungsten Inert Gas વેલ્ડિંગ. તેમાં ટંગસ્ટનનું ઇલેક્ટ્રોડ પીગળતું નથી, ફક્ત આર્ક બનાવે છે, અને ફિલર રોડ બીજા હાથે અલગથી નાખવો પડે છે. TIG ધીમું છે પણ તેમાં કાબૂ વધુ મળે, વેલ્ડ ખૂબ સાફ અને સુંદર આવે. તેથી TIG પાતળી શીટ, સ્ટેનલેસ સ્ટીલ અને એલ્યુમિનિયમ માટે વપરાય છે.",
  en: "MIG means Metal Inert Gas welding. In MIG the wire is fed continuously and automatically, that wire itself becomes the filler, and shielding gas comes along with it. So MIG is fast and it is good for thick plates and large production work. TIG means Tungsten Inert Gas welding. In TIG the tungsten electrode does not melt, it only creates the arc, and the filler rod has to be fed separately with the other hand. TIG is slower but gives much better control and a very clean and neat weld. That is why TIG is used for thin sheets, stainless steel and aluminium.",
  tip: "બંનેનાં પૂરાં નામ બોલો અને «કયું કામ માટે વપરાય» એ પણ કહો — એ જ ખરો ભેદ છે."
},
{
  id: 4,
  cat: "ખામી",
  q: "What are common welding defects and what causes them?",
  kw: [["porosity", "pore", "hole", "blow hole", "gas", "moisture", "wet", "damp", "rust", "dirty", "clean"], ["undercut", "under cut", "overlap", "high current", "excess current", "speed"], ["crack", "cracking", "cooling", "cool", "fast", "stress", "hydrogen"], ["slag", "slag inclusion", "inclusion", "clean", "cleaning", "layer"], ["penetration", "lack of penetration", "incomplete", "distortion", "spatter", "low current", "gap", "angle", "current", "speed"]],
  gu: "સામાન્ય વેલ્ડિંગ ખામીઓ આ છે. પહેલી, પોરોસિટી એટલે વેલ્ડમાં નાનાં ગૅસનાં છિદ્ર — ભીનું કે કાટવાળું જોબ, ભીના ઇલેક્ટ્રોડ કે શીલ્ડિંગ ગૅસની અછતથી થાય. બીજી, અન્ડરકટ — કરંટ વધુ પડતો હોય કે ઝડપ વધુ હોય તો ધારે ખાડો પડે. ત્રીજી, ક્રેક — વેલ્ડ ખૂબ ઝડપથી ઠંડું પડે કે તાણ વધુ હોય તો તિરાડ પડે. ચોથી, સ્લેગ ઇન્ક્લુઝન — બે લેયર વચ્ચેનું સ્લેગ સાફ ન કરીએ તો તે વેલ્ડમાં દબાઈ જાય. પાંચમી, લેક ઓફ પેનિટ્રેશન — કરંટ ઓછો હોય, ગૅપ ખોટો હોય કે ઝડપ વધુ હોય તો વેલ્ડ પૂરી ઊંડાઈ સુધી પહોંચે નહીં. બચવા માટે જોબ સાફ કરવો, સૂકા ઇલેક્ટ્રોડ વાપરવા, સાચો કરંટ રાખવો, અને દરેક લેયર પછી સ્લેગ સાફ કરવો.",
  en: "The common welding defects are these. First, porosity, which means small gas holes in the weld, caused by a wet or rusty job, damp electrodes, or not enough shielding gas. Second, undercut, which is a groove at the edge caused by too much current or too much travel speed. Third, cracking, which happens when the weld cools too fast or there is too much stress. Fourth, slag inclusion, where the slag between two layers is not cleaned and gets trapped in the weld. Fifth, lack of penetration, where the weld does not reach the full depth because the current is too low, the gap is wrong, or the speed is too high. To avoid these I clean the job, use dry electrodes, set the correct current, and clean the slag after every layer.",
  tip: "ઓછામાં ઓછી ત્રણ ખામી નામ સાથે અને તેનું કારણ સાથે બોલો. ફક્ત નામ ગણાવવાથી અડધા ગુણ મળે."
},
{
  id: 5,
  cat: "મશીન સેટિંગ",
  q: "How do you decide the correct current and electrode size for a job?",
  kw: [["thickness", "thick", "thin", "plate", "sheet", "metal", "material"], ["electrode", "rod", "size", "diameter", "mm", "2.5", "3.15", "4"], ["current", "ampere", "amp", "setting", "chart", "table", "recommend"], ["position", "flat", "vertical", "overhead", "joint", "type"], ["test", "trial", "sample", "scrap", "piece", "check", "practice", "adjust"]],
  gu: "પહેલાં જોબની ધાતુ કઈ છે અને તેની જાડાઈ કેટલી છે તે જોઉં છું. જાડાઈ પ્રમાણે ઇલેક્ટ્રોડનો વ્યાસ પસંદ કરું છું — પાતળી શીટ માટે ૨.૫ મિલીમીટર અને જાડી પ્લેટ માટે ૩.૧૫ કે ૪ મિલીમીટર. પછી ઇલેક્ટ્રોડના પૅકેટ પર કે સ્ટાન્ડર્ડ ચાર્ટમાં આપેલી એમ્પિયર રેન્જ પ્રમાણે કરંટ સેટ કરું છું. વેલ્ડિંગની પોઝિશન પણ ધ્યાનમાં લઉં છું — વર્ટિકલ કે ઓવરહેડમાં ફ્લેટ કરતાં થોડો ઓછો કરંટ રાખવો પડે. પછી ભંગાર ટુકડા પર એક ટ્રાયલ વેલ્ડ મારીને જોઉં છું. કરંટ વધુ હોય તો સ્પાર્ક ખૂબ ઉડે અને ધાર બળે, ઓછો હોય તો આર્ક વારંવાર તૂટે અને ઇલેક્ટ્રોડ ચીટકે. ટ્રાયલ પ્રમાણે કરંટ સુધારીને પછી ખરો જોબ કરું છું.",
  en: "First I check which metal the job is and how thick it is. According to the thickness I select the electrode diameter, for example two point five millimetre for thin sheet and three point one five or four millimetre for thick plate. Then I set the current according to the ampere range given on the electrode packet or in the standard chart. I also consider the welding position, because in vertical or overhead welding the current has to be a little lower than in flat position. Then I make a trial weld on a scrap piece. If the current is too high there is a lot of spatter and the edges burn, and if it is too low the arc keeps breaking and the electrode sticks. I adjust the current according to the trial and then do the actual job.",
  tip: "«ભંગાર ટુકડા પર ટ્રાયલ મારું છું» — આ મુદ્દો ઉમેરવાથી પ્રેક્ટિકલ અનુભવ સ્પષ્ટ દેખાય છે."
},
{
  id: 6,
  cat: "તૈયારી",
  q: "How do you prepare the joint before welding?",
  kw: [["clean", "cleaning", "rust", "paint", "oil", "grease", "dirt", "scale", "wire brush", "grinder", "grind"], ["edge", "bevel", "chamfer", "v", "prepare", "angle", "groove"], ["gap", "root gap", "fit", "fit up", "align", "alignment", "straight"], ["clamp", "tack", "tack weld", "fixture", "hold", "jig", "distortion", "move"], ["earth", "earth clamp", "ground", "connection", "tight"]],
  gu: "પહેલાં જોડાણની જગ્યાએથી કાટ, પેઇન્ટ, તેલ, ગ્રીસ અને ધૂળ વાયર બ્રશ કે ગ્રાઇન્ડરથી પૂરેપૂરી સાફ કરું છું — ગંદકી રહી જાય તો પોરોસિટી થાય. જાડી પ્લેટ હોય તો ધારને ગ્રાઇન્ડરથી બેવલ કરીને V ગ્રુવ બનાવું છું, જેથી વેલ્ડ પૂરી ઊંડાઈ સુધી પહોંચે. પછી બે ટુકડાનું ફિટ-અપ ચકાસું છું — રૂટ ગૅપ સરખો અને ધાર સીધી છે તે જોઉં છું. પછી ક્લેમ્પ કે જિગમાં પકડીને થોડા થોડા અંતરે ટૅક વેલ્ડ મારું છું, જેથી ગરમીથી જોબ ખસે નહીં કે વાંકો ન વળે. છેલ્લે અર્થ ક્લેમ્પ સાફ જગ્યાએ મજબૂત જોડું છું, નહીં તો આર્ક બરાબર બનતી નથી.",
  en: "First I completely clean the joint area of rust, paint, oil, grease and dust using a wire brush or a grinder, because if dirt remains it causes porosity. If the plate is thick I bevel the edges with a grinder to make a V groove, so that the weld reaches the full depth. Then I check the fit up of the two pieces, making sure the root gap is even and the edges are straight. After that I hold them in a clamp or jig and put tack welds at intervals, so the job does not move or distort due to the heat. Finally I connect the earth clamp tightly at a clean spot, otherwise the arc does not form properly.",
  tip: "«ટૅક વેલ્ડ» અને «અર્થ ક્લેમ્પ સાફ જગ્યાએ» — આ બે વ્યવહારુ મુદ્દા બોલવાથી અનુભવ દેખાય છે."
},
{
  id: 7,
  cat: "સલામતી",
  q: "What is arc eye or flash burn, and how do you avoid it?",
  kw: [["eye", "eyes", "burn", "flash", "arc eye", "pain", "sand", "irritation", "red", "water"], ["ultraviolet", "uv", "ray", "rays", "radiation", "light", "arc light"], ["helmet", "shield", "filter", "glass", "shade", "number", "dark", "goggles"], ["screen", "curtain", "booth", "warn", "warning", "other", "people", "around", "nearby"], ["doctor", "treatment", "cold", "wash", "rest", "dark", "hour", "temporary"]],
  must: [{ kw: ["helmet", "shield", "filter", "glass", "shade", "goggles", "dark glass", "screen"], gu: "યોગ્ય શેડનો ફિલ્ટર ગ્લાસ / હેલ્મેટ વાપરવો" }],
  gu: "આર્ક આઇ કે ફ્લેશ બર્ન એટલે વેલ્ડિંગ આર્કના અલ્ટ્રાવાયોલેટ કિરણોથી આંખની ઉપરની સપાટી બળી જવી. તેની અસર તરત નહીં પણ ચાર-આઠ કલાક પછી દેખાય — આંખમાં રેતી પડી હોય એવો દુખાવો થાય, આંખ લાલ થાય, પાણી આવે અને પ્રકાશ સહન ન થાય. બચવા માટે યોગ્ય નંબરના ડાર્ક ફિલ્ટર ગ્લાસવાળું વેલ્ડિંગ હેલ્મેટ પહેરવું ફરજિયાત છે, અને આર્ક ચાલુ કરતાં પહેલાં જ હેલ્મેટ નીચે લેવું. કામની આસપાસ વેલ્ડિંગ સ્ક્રીન કે પડદો રાખવો, જેથી બીજા લોકોની આંખ પર આર્કનો પ્રકાશ ન પડે, અને આર્ક ચાલુ કરતાં પહેલાં આસપાસના લોકોને ચેતવવા. આર્ક આઇ થાય તો આંખ ચોળવી નહીં, અંધારામાં આરામ કરવો, ઠંડું પાણી લગાવવું અને ડોક્ટરને બતાવવું. તે સામાન્ય રીતે એક-બે દિવસમાં મટે છે.",
  en: "Arc eye or flash burn means the surface of the eye is burned by the ultraviolet rays of the welding arc. The effect is not felt immediately but appears after four to eight hours, and it feels like sand in the eye, with redness, watering and pain in light. To avoid it, it is compulsory to wear a welding helmet with the correct shade of dark filter glass, and to bring the helmet down before striking the arc. Welding screens or curtains should be kept around the work area so the arc light does not fall on other people eyes, and I warn the people nearby before striking the arc. If arc eye happens, do not rub the eye, rest in a dark room, apply a cold compress and see a doctor. It normally heals in one or two days.",
  tip: "«અસર ચાર-આઠ કલાક પછી દેખાય» — આ મુદ્દો બોલવાથી ખરી તાલીમ સાબિત થાય છે."
},
{
  id: 8,
  cat: "ગુણવત્તા",
  q: "How do you check the quality of a weld after welding?",
  kw: [["visual", "look", "see", "eye", "inspect", "inspection", "clean", "slag", "brush"], ["crack", "porosity", "hole", "undercut", "spatter", "defect", "uniform", "even", "bead", "size", "straight"], ["measure", "gauge", "weld gauge", "size", "leg", "throat", "drawing", "specification"], ["dye penetrant", "dye", "penetrant", "dp", "magnetic", "mpi", "ultrasonic", "radiograph", "x ray", "x-ray", "ndt"], ["leak", "water", "pressure", "test", "load", "supervisor", "qc", "quality", "approve", "reject", "repair", "grind"]],
  gu: "પહેલાં સ્લેગ સાફ કરીને વાયર બ્રશથી વેલ્ડ ચોખ્ખો કરું છું. પછી વિઝ્યુઅલ ઇન્સ્પેક્શન કરું છું — વેલ્ડ બીડ સરખો અને એકધારો છે કે નહીં, તિરાડ, છિદ્ર, અન્ડરકટ કે વધુ સ્પેટર નથી ને, અને શરૂઆત-અંત બરાબર ભરાયા છે કે નહીં તે જોઉં છું. પછી વેલ્ડ ગેજથી બીડનું માપ લઈને ડ્રોઇંગમાં આપેલા માપ સાથે સરખાવું છું. વધુ ચોકસાઈ જોઈએ તો NDT એટલે નોન-ડિસ્ટ્રક્ટિવ ટેસ્ટ કરાય છે — જેમ કે ડાય પેનિટ્રન્ટ ટેસ્ટ સપાટીની તિરાડ પકડે, અને અલ્ટ્રાસોનિક કે X-રે ટેસ્ટ અંદરની ખામી પકડે. ટાંકી કે પાઇપ હોય તો પ્રેશર કે લીક ટેસ્ટ થાય. ખામી મળે તો એ ભાગ ગ્રાઇન્ડ કરીને ફરી વેલ્ડ કરું છું અને સુપરવાઇઝર કે QC ને જાણ કરું છું.",
  en: "First I clean the slag and brush the weld clean with a wire brush. Then I do a visual inspection, checking whether the weld bead is uniform and even, whether there are any cracks, holes, undercut or too much spatter, and whether the start and the end are properly filled. Then I measure the bead with a weld gauge and compare it with the size given in the drawing. If more accuracy is needed, NDT, that is non destructive testing, is done, for example a dye penetrant test finds surface cracks, and ultrasonic or X-ray testing finds internal defects. For a tank or a pipe a pressure or leak test is done. If I find a defect I grind that portion and weld it again, and I inform my supervisor or the QC person.",
  tip: "«વિઝ્યુઅલ ઇન્સ્પેક્શન» પહેલાં અને «NDT» પછી — આ ક્રમમાં બોલો. NDT નું પૂરું નામ પણ આપો."
},
{
  id: 9,
  cat: "સિલિન્ડર સંભાળ",
  q: "What precautions do you take while handling gas cylinders?",
  kw: [["upright", "vertical", "stand", "standing", "chain", "chained", "tie", "secure", "trolley", "fall"], ["oil", "grease", "oxygen", "never", "not", "clean", "hand"], ["leak", "leakage", "soap", "soap water", "check", "hose", "regulator", "valve", "test"], ["heat", "sun", "fire", "flame", "spark", "away", "hot", "cool", "ventilat"], ["cap", "valve", "close", "closed", "off", "roll", "drop", "drag", "carefully", "empty", "separate"]],
  must: [
    { kw: ["upright", "vertical", "stand", "chain", "chained", "tie", "secure", "trolley", "fix", "not fall"], gu: "સિલિન્ડર ઊભા રાખીને ચેઇનથી બાંધવા" },
    { kw: ["oil", "grease", "no oil", "not oil", "never oil", "without oil", "clean hand", "greasy"], gu: "ઓક્સિજન સિલિન્ડરને તેલ-ગ્રીસથી દૂર રાખવું" }
  ],
  gu: "ગૅસ સિલિન્ડર હંમેશા ઊભા રાખું છું અને ચેઇન કે પટ્ટાથી દીવાલ કે ટ્રોલી સાથે બાંધું છું, જેથી પડી ન જાય — સિલિન્ડર પડે અને વાલ્વ તૂટે તો તે રોકેટ જેવું ઉડે. સિલિન્ડર કદી ગબડાવીને કે ઘસડીને લઈ જતો નથી, ટ્રોલી વાપરું છું, અને લઈ જતી વખતે વાલ્વ બંધ કરીને પ્રોટેક્શન કૅપ લગાવું છું. ઓક્સિજન સિલિન્ડર, રેગ્યુલેટર કે વાલ્વ પર તેલ કે ગ્રીસ કદી લગાડતો નથી અને તેલવાળા હાથે અડતો નથી, કારણ કે ઓક્સિજન સાથે તેલ ભળે તો જાતે આગ પકડે. લીકેજ તપાસવા સાબુવાળું પાણી લગાવું છું — દીવાસળી કે લાઇટર કદી નહીં. સિલિન્ડરને ગરમી, તાપ, આગ અને સ્પાર્કથી દૂર રાખું છું. કામ પૂરું થાય તો વાલ્વ બંધ કરું છું, અને ભરેલા તથા ખાલી સિલિન્ડર અલગ રાખું છું.",
  en: "I always keep gas cylinders upright and tie them to a wall or trolley with a chain or belt so that they cannot fall, because if a cylinder falls and the valve breaks it can fly like a rocket. I never roll or drag a cylinder, I use a trolley, and while moving it I close the valve and fit the protection cap. I never apply oil or grease on an oxygen cylinder, regulator or valve and I do not touch it with oily hands, because oil with oxygen can catch fire by itself. To check for leaks I apply soap water, never a matchstick or lighter. I keep the cylinders away from heat, direct sun, flame and sparks. After the work I close the valves, and I keep full and empty cylinders separately.",
  tip: "«તેલ-ગ્રીસ અને ઓક્સિજન» નું જોખમ અને «સિલિન્ડર બાંધવો» — આ બે ચૂકી ગયા તો સલામતીની સમજ અધૂરી ગણાય છે."
},
{
  id: 10,
  cat: "કામનો અનુભવ",
  q: "Which welding positions can you weld in, and which one is the most difficult?",
  kw: [["flat", "down hand", "downhand", "1g", "1f"], ["horizontal", "2g", "2f"], ["vertical", "3g", "3f", "up", "down"], ["overhead", "4g", "4f"], ["difficult", "hard", "hardest", "gravity", "molten", "metal", "fall", "drip", "control", "current", "practice", "speed"]],
  gu: "ચાર મુખ્ય પોઝિશન છે — ફ્લેટ કે ડાઉનહેન્ડ, હોરિઝોન્ટલ, વર્ટિકલ અને ઓવરહેડ. તમે ખરેખર જેમાં કામ કર્યું હોય તે કહો. ઓવરહેડ સૌથી અઘરી ગણાય છે, કારણ કે તેમાં પીગળેલી ધાતુ ગુરુત્વાકર્ષણને કારણે નીચે ટપકે છે. તેથી ઓવરહેડમાં કરંટ થોડો ઓછો રાખવો પડે, ટૂંકી આર્ક રાખવી પડે અને ઝડપ સરખી રાખવી પડે. જવાબમાં ઉમેરો કે તમે કઈ પોઝિશનમાં આત્મવિશ્વાસ ધરાવો છો અને કઈમાં હજી પ્રેક્ટિસ કરી રહ્યા છો — પ્રામાણિક જવાબ સારો લાગે છે.",
  en: "There are four main positions, flat or downhand, horizontal, vertical and overhead. I am confident in flat, horizontal and vertical positions, and I am still practising overhead. Overhead is considered the most difficult, because the molten metal drips down due to gravity. So in overhead welding the current has to be kept a little lower, a short arc has to be maintained, and the travel speed has to be steady.",
  tip: "ખોટો દાવો ન કરો. «આ પોઝિશનમાં આત્મવિશ્વાસ છે, આમાં પ્રેક્ટિસ કરું છું» — આવો પ્રામાણિક જવાબ વધુ સારો લાગે છે."
}
]});
