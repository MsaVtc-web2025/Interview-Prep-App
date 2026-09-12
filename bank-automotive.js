/* ઓટોમોબાઇલ કોર્સ — તકનીકી પ્રશ્ન બેંક
   must = ફરજિયાત સલામતીના મુદ્દા. ચૂકી જાય તો ચેતવણી અને કુલ ગુણ મર્યાદિત. */
registerCourse({
  id: "automotive",
  name: "ઓટોમોબાઇલ",
  icon: "🔧",
  tagline: "એન્જિન, બ્રેક, સર્વિસ અને ડાયગ્નોસિસ",
  mode: "technical",
  questions: [
{
  id: 1,
  cat: "એન્જિન",
  q: "What is the difference between a petrol engine and a diesel engine?",
  i18n: {
    gu: { q: "Petrol engine અને diesel engine વચ્ચે શું ફરક છે?" },
    hi: { q: "Petrol engine और diesel engine में क्या फ़र्क़ है?",
          gu: "Petrol engine में हवा और petrol का मिश्रण दबता है और फिर spark plug की चिंगारी से जलता है, इसलिए उसे spark ignition engine कहते हैं। Diesel engine में सिर्फ़ हवा बहुत ज़्यादा दबाई जाती है, जिससे हवा बहुत गर्म हो जाती है, और फिर injector से diesel छिड़कते ही वह अपने आप जल उठता है — उसे compression ignition कहते हैं। Diesel engine में torque और mileage ज़्यादा मिलता है, पर आवाज़ और vibration भी ज़्यादा होता है।",
          tip: "«Spark ignition» और «compression ignition» ये दो तकनीकी शब्द बोलिए। इससे जवाब पेशेवर लगता है।" },
    en: { tip: "Say the two technical terms 'spark ignition' and 'compression ignition'. They make the answer sound professional." }
  },
  kw: [["petrol", "gasoline"], ["diesel"], ["spark", "spark plug", "spark ignition", "plug"], ["compression", "compression ignition", "heat", "pressure", "self"], ["mileage", "efficient", "efficiency", "torque", "power", "cost", "noise", "sound", "injector"]],
  gu: "પેટ્રોલ એન્જિનમાં હવા અને પેટ્રોલનું મિશ્રણ દબાય છે અને પછી સ્પાર્ક પ્લગની ચિનગારીથી સળગે છે, તેથી તેને સ્પાર્ક ઇગ્નિશન એન્જિન કહે છે. ડીઝલ એન્જિનમાં ફક્ત હવા ખૂબ વધારે દબાય છે, જેથી હવા ખૂબ ગરમ થાય, અને પછી ઇન્જેક્ટર દ્વારા ડીઝલ છાંટતાં તે જાતે સળગે છે — તેને કમ્પ્રેશન ઇગ્નિશન કહે છે. ડીઝલ એન્જિનમાં ટોર્ક અને માઇલેજ વધારે મળે, પણ અવાજ અને વાઇબ્રેશન વધુ હોય છે.",
  en: "In a petrol engine the mixture of air and petrol is compressed and then burned by a spark from the spark plug, so it is called a spark ignition engine. In a diesel engine only air is compressed very highly so the air becomes very hot, and then diesel is sprayed by the injector and it burns by itself, which is called compression ignition. A diesel engine gives more torque and better mileage, but it has more noise and vibration.",
  tip: "«સ્પાર્ક ઇગ્નિશન» અને «કમ્પ્રેશન ઇગ્નિશન» એ બે તકનીકી શબ્દો બોલો. તેનાથી જવાબ વ્યાવસાયિક લાગે છે."
},
{
  id: 2,
  cat: "એન્જિન",
  q: "Explain the four strokes of a four stroke engine.",
  i18n: {
    gu: { q: "Four stroke engine ના ચાર strokes સમજાવો." },
    hi: { q: "Four stroke engine के चारों strokes समझाइए।",
          gu: "चारों stroke इस क्रम में होते हैं। पहला, suction stroke — inlet valve खुलता है और piston नीचे जाते हुए हवा और ईंधन अंदर खींचता है। दूसरा, compression stroke — दोनों valve बंद होते हैं और piston ऊपर जाकर मिश्रण दबाता है। तीसरा, power stroke — मिश्रण जलता है और piston ज़ोर से नीचे धकेला जाता है, जिससे power मिलता है। चौथा, exhaust stroke — exhaust valve खुलता है और piston ऊपर जाकर जला हुआ धुआँ बाहर निकालता है।",
          tip: "चारों नाम क्रम से बोलिए और हर एक के साथ बताइए कि piston ऊपर जाता है या नीचे। यह सवाल लगभग हर interview में पूछा जाता है।" },
    en: { tip: "Name all four in order, and with each one say whether the piston goes up or down. This question comes up in almost every interview." }
  },
  kw: [["suction", "intake", "inlet", "induction"], ["compression", "compress"], ["power", "combustion", "expansion", "explosion", "ignition"], ["exhaust", "outlet"], ["piston", "valve", "crank", "down", "up", "cycle"]],
  gu: "ચાર સ્ટ્રોક આ ક્રમમાં થાય છે. પહેલો, સક્શન સ્ટ્રોક — ઇનલેટ વાલ્વ ખૂલે અને પિસ્ટન નીચે જતાં હવા અને ઇંધણ અંદર ખેંચાય. બીજો, કમ્પ્રેશન સ્ટ્રોક — બંને વાલ્વ બંધ થાય અને પિસ્ટન ઉપર જઈને મિશ્રણ દબાવે. ત્રીજો, પાવર સ્ટ્રોક — મિશ્રણ સળગે અને પિસ્ટન જોરથી નીચે ધકેલાય, જેમાંથી પાવર મળે. ચોથો, એક્ઝોસ્ટ સ્ટ્રોક — એક્ઝોસ્ટ વાલ્વ ખૂલે અને પિસ્ટન ઉપર જઈને બળેલો ધુમાડો બહાર કાઢે.",
  en: "The four strokes happen in this order. First, the suction stroke, where the inlet valve opens and the piston moves down to draw in air and fuel. Second, the compression stroke, where both valves close and the piston moves up to compress the mixture. Third, the power stroke, where the mixture burns and pushes the piston down forcefully, and this gives the power. Fourth, the exhaust stroke, where the exhaust valve opens and the piston moves up to push out the burnt gases.",
  tip: "ચારેય નામ ક્રમમાં બોલો અને દરેક સાથે પિસ્ટન ઉપર જાય કે નીચે તે કહો. આ પ્રશ્ન લગભગ દરેક ઇન્ટરવ્યુમાં પુછાય છે."
},
{
  id: 3,
  cat: "બ્રેક સિસ્ટમ",
  q: "How does a hydraulic brake system work?",
  i18n: {
    gu: { q: "Hydraulic brake system કેવી રીતે કામ કરે છે?" },
    hi: { q: "Hydraulic brake system कैसे काम करता है?",
          gu: "जब driver brake pedal दबाता है तो वह master cylinder के piston को धकेलता है। इससे brake fluid में दबाव पैदा होता है। Fluid दब नहीं सकता, इसलिए वह दबाव pipe के ज़रिए चारों पहियों तक बराबर पहुँचता है। वहाँ wheel cylinder या caliper के piston बाहर धकेले जाते हैं और brake shoe या pad को drum या disc से दबाते हैं। Friction से पहिया धीमा पड़ता है और गाड़ी रुक जाती है। Brake fluid का level और leakage नियमित जाँचना ज़रूरी है, और line में हवा आ जाए तो brake नरम पड़ जाते हैं, तब bleeding करनी पड़ती है।",
          tip: "«Fluid दब नहीं सकता» यही मुख्य सिद्धांत है — यह बोलने से समझ दिखती है।" },
    en: { tip: "'Fluid cannot be compressed' is the key principle — saying it shows you understand the system." }
  },
  kw: [["pedal", "press", "push", "foot"], ["master cylinder", "master"], ["brake fluid", "fluid", "oil", "liquid", "pressure"], ["wheel cylinder", "caliper", "piston", "wheel"], ["shoe", "pad", "drum", "disc", "friction", "stop", "slow"]],
  must: [{ kw: ["fluid level", "level", "leak", "leakage", "check", "air", "bleed"], gu: "બ્રેક ફ્લુઇડનું લેવલ કે લીકેજ તપાસવું" }],
  gu: "જ્યારે ડ્રાઇવર બ્રેક પેડલ દબાવે ત્યારે તે માસ્ટર સિલિન્ડરના પિસ્ટનને ધકેલે છે. તેનાથી બ્રેક ફ્લુઇડમાં દબાણ પેદા થાય છે. ફ્લુઇડ દબાઈ શકતું નથી, તેથી એ દબાણ પાઇપ મારફતે ચારેય પહિયાં સુધી સરખું પહોંચે છે. ત્યાં વ્હીલ સિલિન્ડર કે કેલિપરના પિસ્ટન બહાર ધકેલાય છે અને બ્રેક શૂ કે પેડને ડ્રમ કે ડિસ્ક સાથે દબાવે છે. ઘર્ષણથી પહિયું ધીમું પડે અને ગાડી ઊભી રહે. બ્રેક ફ્લુઇડનું લેવલ અને લીકેજ નિયમિત તપાસવું જરૂરી છે, અને લાઇનમાં હવા આવે તો બ્રેક નરમ પડે એટલે બ્લીડિંગ કરવું પડે.",
  en: "When the driver presses the brake pedal, it pushes the piston of the master cylinder. This creates pressure in the brake fluid. Fluid cannot be compressed, so that pressure travels equally through the pipes to all four wheels. There the pistons of the wheel cylinder or caliper are pushed out and press the brake shoe or pad against the drum or disc. The friction slows the wheel and stops the vehicle. It is important to check the brake fluid level and any leakage regularly, and if air enters the line the brakes become soft, so bleeding has to be done.",
  tip: "«ફ્લુઇડ દબાઈ શકતું નથી» એ મુખ્ય સિદ્ધાંત છે — તે બોલવાથી સમજ દેખાય છે."
},
{
  id: 4,
  cat: "સર્વિસ",
  q: "What do you check during a regular vehicle service?",
  i18n: {
    gu: { q: "Regular vehicle service માં તમે શું તપાસો છો?" },
    hi: { q: "Regular vehicle service में आप क्या जाँचते हैं?",
          gu: "नियमित service में पहले engine oil का level और हालत जाँचकर ज़रूरत हो तो बदलता हूँ। फिर oil filter, air filter और fuel filter जाँचता हूँ। उसके बाद brake pad या shoe का घिसाव और brake fluid का level देखता हूँ। फिर tyre का pressure और घिसाव जाँचता हूँ। फिर battery के terminal, coolant का level, belt की tightness, spark plug और सारी lights जाँचता हूँ। आख़िर में test drive लेकर देखता हूँ कि कोई आवाज़ या दिक़्क़त तो नहीं है।",
          tip: "आख़िर में «test drive लेता हूँ» जोड़िए — service station में यह बात बहुत पसंद की जाती है।" },
    en: { tip: "Add 'I take a test drive' at the end — service stations value that a great deal." }
  },
  kw: [["engine oil", "oil", "lubricant"], ["filter", "air filter", "oil filter", "fuel filter"], ["brake", "brake pad", "brake shoe", "brake fluid"], ["tyre", "tire", "pressure", "air", "wheel"], ["battery", "coolant", "water", "light", "clutch", "belt", "plug"]],
  gu: "નિયમિત સર્વિસમાં પહેલાં એન્જિન ઓઇલનું લેવલ અને હાલત તપાસીને જરૂર પડે તો બદલું છું. પછી ઓઇલ ફિલ્ટર, એર ફિલ્ટર અને ફ્યુઅલ ફિલ્ટર ચકાસું છું. ત્યાર બાદ બ્રેક પેડ કે શૂનું ઘસારો અને બ્રેક ફ્લુઇડનું લેવલ જોઉં છું. પછી ટાયરનું પ્રેશર અને ઘસારો તપાસું છું. પછી બેટરીના ટર્મિનલ, કૂલન્ટનું લેવલ, બેલ્ટની ટાઇટનેસ, સ્પાર્ક પ્લગ અને બધી લાઇટ ચકાસું છું. છેલ્લે ટેસ્ટ ડ્રાઇવ લઈને કોઈ અવાજ કે સમસ્યા નથી તે જોઉં છું.",
  en: "In a regular service I first check the engine oil level and condition and change it if needed. Then I check the oil filter, air filter and fuel filter. After that I check the brake pad or shoe wear and the brake fluid level. Next I check the tyre pressure and tyre wear. Then I check the battery terminals, the coolant level, the belt tension, the spark plugs and all the lights. Finally I take a test drive to make sure there is no noise or problem.",
  tip: "છેલ્લે «ટેસ્ટ ડ્રાઇવ લઉં છું» ઉમેરો — સર્વિસ સ્ટેશનમાં આ મુદ્દો ખૂબ ગમે છે."
},
{
  id: 5,
  cat: "ડાયગ્નોસિસ",
  q: "A customer says the car is not starting. How will you find the problem?",
  i18n: {
    gu: { q: "ગ્રાહક કહે છે કે ગાડી ચાલુ થતી નથી. તમે problem કેવી રીતે શોધશો?" },
    hi: { q: "ग्राहक कहता है कि गाड़ी स्टार्ट नहीं हो रही। आप problem कैसे ढूँढेंगे?",
          gu: "पहले ग्राहक से पूछता हूँ कि कब से हो रहा है और चाबी घुमाने पर कोई आवाज़ आती है या नहीं — इससे आधा कारण वहीं पता चल जाता है। फिर battery जाँचता हूँ, क्योंकि वही सबसे आम वजह है — terminal ढीले या जंग लगे हैं या voltage कम है, यह देखता हूँ। फिर टंकी में ईंधन है या नहीं और fuel pump चल रहा है या नहीं यह जाँचता हूँ। उसके बाद self motor और उसके connection जाँचता हूँ। फिर spark plug और ignition coil देखता हूँ। आख़िर में fuse और wiring जाँचता हूँ।",
          tip: "«पहले ग्राहक से पूछता हूँ» — यह पहला क़दम बोलने से आप पेशेवर लगेंगे।" },
    en: { tip: "'First I ask the customer' — leading with that step makes you sound professional." }
  },
  kw: [["battery", "terminal", "charge", "voltage", "weak", "dead"], ["fuel", "petrol", "diesel", "tank", "pump", "empty"], ["starter", "self", "motor", "solenoid", "crank", "cranking"], ["spark", "plug", "ignition", "coil"], ["ask", "customer", "sound", "noise", "listen", "check", "wire", "fuse", "connection"]],
  gu: "પહેલાં ગ્રાહકને પૂછું છું કે ક્યારથી થાય છે અને ચાવી ફેરવતાં કોઈ અવાજ આવે છે કે નહીં — તેનાથી અડધું કારણ ખબર પડી જાય. પછી બેટરી તપાસું છું, કારણ કે એ સૌથી સામાન્ય કારણ છે — ટર્મિનલ ઢીલા કે કાટવાળા છે કે વોલ્ટેજ ઓછો છે તે જોઉં છું. પછી ટાંકીમાં ઇંધણ છે કે નહીં અને ફ્યુઅલ પંપ ચાલે છે કે નહીં તે ચકાસું છું. ત્યાર બાદ સેલ્ફ મોટર અને તેના જોડાણ તપાસું છું. પછી સ્પાર્ક પ્લગ અને ઇગ્નિશન કોઇલ જોઉં છું. છેલ્લે ફ્યુઝ અને વાયરિંગ ચકાસું છું.",
  en: "First I ask the customer since when it is happening and whether there is any sound when the key is turned, because that already tells me half the reason. Then I check the battery, since that is the most common cause, and I look for loose or corroded terminals and low voltage. Next I check whether there is fuel in the tank and whether the fuel pump is working. After that I check the starter motor and its connections. Then I check the spark plugs and the ignition coil. Finally I check the fuses and the wiring.",
  tip: "«પહેલાં ગ્રાહકને પૂછું છું» — આ પ્રથમ પગલું બોલવાથી તમે વ્યાવસાયિક લાગશો."
},
{
  id: 6,
  cat: "સલામતી",
  q: "What safety precautions do you take while working in a workshop?",
  i18n: {
    gu: { q: "Workshop માં કામ કરતી વખતે કઈ safety precautions લો છો?" },
    hi: { q: "Workshop में काम करते समय कौन सी safety precautions लेते हैं?",
          gu: "Workshop में हमेशा safety shoes, gloves, goggles और uniform पहनता हूँ। गाड़ी ऊपर उठानी हो तो सिर्फ़ jack पर भरोसा नहीं करता — jack stand लगाता हूँ, handbrake लगाता हूँ और पहियों के नीचे chock रखता हूँ। Petrol या diesel के पास धूम्रपान या spark वाला काम नहीं करता, और fire extinguisher कहाँ है यह जानता हूँ। Engine चालू रखना पड़े तो हवादार खुली जगह में काम करता हूँ, क्योंकि धुआँ ज़हरीला होता है। ज़मीन पर oil गिरा हो तो तुरंत साफ़ करता हूँ और हर काम के लिए सही tool इस्तेमाल करता हूँ।",
          tip: "«Jack पर भरोसा मत कीजिए, jack stand लगाइए» — यह बात छूट गई तो safety की समझ अधूरी मानी जाती है।" },
    en: { tip: "'Never trust the jack alone, use a jack stand' — miss this and your safety knowledge is judged incomplete." }
  },
  kw: [["gloves", "goggles", "shoes", "safety shoes", "ppe", "helmet", "uniform", "apron"], ["jack", "jack stand", "stand", "support", "lift", "wheel chock", "chock"], ["fire", "extinguisher", "smoking", "spark", "petrol", "inflammable", "flammable"], ["ventilation", "air", "fume", "smoke", "exhaust", "open"], ["tool", "proper", "correct", "clean", "tidy", "spill", "oil"]],
  must: [
    { kw: ["gloves", "goggles", "shoes", "ppe", "safety shoes", "helmet", "apron"], gu: "સલામતી સાધનો (PPE) પહેરવાં" },
    { kw: ["jack stand", "stand", "support", "chock", "block", "brake", "handbrake", "gear", "secure"], gu: "ગાડીને જૅક સ્ટૅન્ડ કે ચૉકથી સ્થિર કરવી" }
  ],
  gu: "વર્કશોપમાં હંમેશા સેફ્ટી શૂઝ, ગ્લવ્ઝ, ગોગલ્સ અને યુનિફોર્મ પહેરું છું. ગાડી ઊંચી કરવી હોય તો ફક્ત જૅક પર ભરોસો કરતો નથી — જૅક સ્ટૅન્ડ મૂકું છું, હેન્ડબ્રેક લગાવું છું અને પહિયાં નીચે ચૉક મૂકું છું. પેટ્રોલ કે ડીઝલ પાસે ધૂમ્રપાન કે સ્પાર્કવાળું કામ કરતો નથી, અને ફાયર એક્સ્ટિંગ્વિશર ક્યાં છે તે જાણું છું. એન્જિન ચાલુ રાખવું પડે તો હવાની આવ-જા હોય એવી ખુલ્લી જગ્યામાં કામ કરું છું, કારણ કે ધુમાડો ઝેરી હોય છે. જમીન પર ઓઇલ પડ્યું હોય તો તરત સાફ કરું છું અને દરેક કામ માટે સાચું ટૂલ વાપરું છું.",
  en: "In the workshop I always wear safety shoes, gloves, goggles and my uniform. If I have to lift a vehicle I never trust the jack alone, I put jack stands, apply the handbrake and put chocks under the wheels. I do not smoke or do spark work near petrol or diesel, and I know where the fire extinguisher is kept. If the engine has to be kept running I work in an open, well ventilated area, because the exhaust fumes are poisonous. If oil is spilled on the floor I clean it immediately, and I always use the correct tool for each job.",
  tip: "«જૅક પર ભરોસો ન કરવો, જૅક સ્ટૅન્ડ મૂકવો» — આ મુદ્દો ચૂકી ગયા તો સલામતીની સમજ અધૂરી ગણાય છે."
},
{
  id: 7,
  cat: "ટ્રાન્સમિશન",
  q: "What is the work of a clutch in a vehicle?",
  i18n: {
    gu: { q: "વાહનમાં clutch નું કામ શું છે?" },
    hi: { q: "गाड़ी में clutch का काम क्या है?",
          gu: "Clutch का काम engine और gearbox के बीच का जोड़ ज़रूरत के अनुसार जोड़ना और छोड़ना है। जब driver clutch pedal दबाता है तो engine का power gearbox से अलग हो जाता है, जिससे gear आसानी से बदलता है। Pedal छोड़ते ही clutch plate flywheel से दबकर power वापस gearbox तक पहुँचाती है। Clutch गाड़ी को धीरे से चालू करने में और engine बंद हुए बिना खड़ी रखने में भी मदद करता है।",
          tip: "«जोड़ना और छोड़ना» यही मुख्य शब्द हैं। फिर gear बदलने का उदाहरण दीजिए।" },
    en: { tip: "'Engaging and disengaging' are the key words. Then give the gear-changing example." }
  },
  kw: [["engine"], ["gearbox", "transmission", "gear"], ["connect", "disconnect", "engage", "disengage", "separate", "join"], ["gear change", "change gear", "shift", "shifting", "smooth", "smoothly"], ["start", "stop", "moving", "slip", "friction", "plate"]],
  gu: "ક્લચનું કામ એન્જિન અને ગિયરબોક્સ વચ્ચેનું જોડાણ જરૂર પ્રમાણે જોડવાનું અને છોડવાનું છે. જ્યારે ડ્રાઇવર ક્લચ પેડલ દબાવે ત્યારે એન્જિનનો પાવર ગિયરબોક્સથી અલગ થઈ જાય છે, જેથી ગિયર સહેલાઈથી બદલાય. પેડલ છોડતાં ક્લચ પ્લેટ ફ્લાયવ્હીલ સાથે દબાઈને પાવર પાછો ગિયરબોક્સ સુધી પહોંચાડે છે. ક્લચ ગાડીને ધીમેથી ચાલુ કરવામાં અને એન્જિન બંધ પડ્યા વગર ઊભી રાખવામાં પણ મદદ કરે છે.",
  en: "The work of the clutch is to connect and disconnect the engine from the gearbox as required. When the driver presses the clutch pedal, the engine power is separated from the gearbox so that the gear can be changed easily. When the pedal is released, the clutch plate presses against the flywheel and sends the power back to the gearbox. The clutch also helps to start the vehicle smoothly and to stop it without the engine switching off.",
  tip: "«જોડવું અને છોડવું» એ મુખ્ય શબ્દો છે. પછી ગિયર બદલવાનું ઉદાહરણ આપો."
},
{
  id: 8,
  cat: "કૂલિંગ સિસ્ટમ",
  q: "Why does an engine overheat, and what will you check?",
  i18n: {
    gu: { q: "Engine કેમ overheat થાય છે, અને તમે શું તપાસશો?" },
    hi: { q: "Engine overheat क्यों होता है, और आप क्या जाँचेंगे?",
          gu: "Engine गर्म होने के कारण — coolant कम हो या leak हो रहा हो, radiator धूल से चोक हो गया हो, cooling fan या उसका belt काम न कर रहा हो, thermostat ख़राब हो, या engine oil कम हो। पहले गाड़ी किनारे खड़ी करके engine बंद करता हूँ। Engine गर्म हो तब radiator की cap नहीं खोलता, क्योंकि गर्म पानी और भाप उड़कर जला सकती है। Engine ठंडा होने के बाद coolant का level, leakage, radiator, fan और belt जाँचता हूँ।",
          tip: "«गर्म engine में radiator cap मत खोलिए» — यह safety की बात बोलना ज़रूरी है।" },
    en: { tip: "'Never open the radiator cap on a hot engine' — this safety point is essential to state." }
  },
  kw: [["coolant", "water", "level", "low", "leak", "leakage"], ["radiator", "block", "choke", "choked", "clean", "fin"], ["fan", "cooling fan", "belt", "sensor", "thermostat"], ["oil", "engine oil", "low oil", "lubrication"], ["stop", "switch off", "cool", "wait", "temperature", "gauge", "warning"]],
  must: [{ kw: ["wait", "cool", "cool down", "not open", "do not open", "never open", "hot", "burn", "after"], gu: "એન્જિન ગરમ હોય ત્યારે રેડિયેટર કૅપ ન ખોલવી" }],
  gu: "એન્જિન ગરમ થવાનાં કારણો — કૂલન્ટ ઓછું હોય કે લીક થતું હોય, રેડિયેટર ધૂળથી ચોકઅપ થયું હોય, કૂલિંગ ફેન કે તેનો બેલ્ટ કામ ન કરતો હોય, થર્મોસ્ટેટ બગડ્યું હોય, અથવા એન્જિન ઓઇલ ઓછું હોય. પહેલાં ગાડી બાજુમાં ઊભી રાખીને એન્જિન બંધ કરું છું. એન્જિન ગરમ હોય ત્યારે રેડિયેટરની કૅપ ખોલતો નથી, કારણ કે ગરમ પાણી અને વરાળ ઉડીને દાઝી જવાય. એન્જિન ઠંડું પડે પછી કૂલન્ટનું લેવલ, લીકેજ, રેડિયેટર, ફેન અને બેલ્ટ તપાસું છું.",
  en: "An engine can overheat because the coolant is low or leaking, the radiator is choked with dust, the cooling fan or its belt is not working, the thermostat is faulty, or the engine oil is low. First I stop the vehicle at the side and switch off the engine. I never open the radiator cap while the engine is hot, because the hot water and steam can come out and burn me. After the engine has cooled down, I check the coolant level, look for leakage, and check the radiator, the fan and the belt.",
  tip: "«ગરમ એન્જિનમાં રેડિયેટર કૅપ ન ખોલવી» — આ સલામતીનો મુદ્દો ફરજિયાત છે."
},
{
  id: 9,
  cat: "ટાયર",
  q: "Why is correct tyre pressure important, and how often should it be checked?",
  i18n: {
    gu: { q: "સાચું tyre pressure શા માટે જરૂરી છે, અને કેટલા સમયે તપાસવું જોઈએ?" },
    hi: { q: "सही tyre pressure क्यों ज़रूरी है, और कितने समय में जाँचना चाहिए?",
          gu: "Tyre का pressure सही होना ज़रूरी है क्योंकि कम pressure हो तो tyre ज़्यादा घिसता है, mileage घटता है और tyre गर्म होकर फटने का ख़तरा रहता है। ज़्यादा pressure हो तो tyre बीच से घिसता है, सड़क पर पकड़ कम हो जाती है और brake लगाने पर गाड़ी skid कर सकती है। सही pressure हो तो tyre बराबर घिसता है, mileage अच्छा मिलता है और गाड़ी क़ाबू में रहती है। Pressure हर हफ़्ते जाँचना चाहिए, और tyre ठंडे हों तब जाँचना चाहिए — गाड़ी चलाने के बाद tyre गर्म हों तो reading ज़्यादा आती है।",
          tip: "«ठंडे tyre में pressure जाँचिए» — यह छोटी बात जोड़ने से असली अनुभव दिखता है।" },
    en: { tip: "'Check the pressure when the tyres are cold' — that small detail signals real workshop experience." }
  },
  kw: [["pressure", "air", "psi"], ["mileage", "fuel", "efficiency", "consumption", "economy"], ["wear", "worn", "uneven", "life", "tyre life", "tire life"], ["grip", "control", "brake", "braking", "skid", "safety", "safe", "burst", "blast"], ["week", "weekly", "regular", "month", "cold", "check"]],
  gu: "ટાયરનું પ્રેશર બરાબર હોવું જરૂરી છે કારણ કે ઓછું પ્રેશર હોય તો ટાયર વધુ ઘસાય, માઇલેજ ઘટે અને ટાયર ગરમ થઈને ફાટવાનું જોખમ રહે. વધુ પ્રેશર હોય તો ટાયર વચ્ચેથી ઘસાય, રોડ પર પકડ ઓછી થાય અને બ્રેક મારતાં ગાડી સ્કિડ થઈ શકે. બરાબર પ્રેશર હોય તો ટાયર સરખું ઘસાય, માઇલેજ સારું મળે અને ગાડી કાબૂમાં રહે. પ્રેશર દર અઠવાડિયે તપાસવું જોઈએ, અને ટાયર ઠંડાં હોય ત્યારે તપાસવું — ગાડી ચલાવ્યા પછી ટાયર ગરમ હોય તો રીડિંગ વધારે આવે.",
  en: "Correct tyre pressure is important because if the pressure is low the tyre wears out faster, the mileage drops, and the tyre can get hot and burst. If the pressure is too high the tyre wears out from the centre, the grip on the road reduces, and the vehicle can skid while braking. With correct pressure the tyre wears evenly, the mileage is good and the vehicle stays in control. The pressure should be checked every week, and it should be checked when the tyres are cold, because after driving the tyres are hot and the reading comes out higher.",
  tip: "«ઠંડાં ટાયરમાં પ્રેશર તપાસવું» — આ નાનો મુદ્દો ઉમેરવાથી ખરો અનુભવ દેખાય છે."
},
{
  id: 10,
  cat: "ગ્રાહક સેવા",
  q: "A customer is angry because the same problem came back after a repair. How will you handle it?",
  i18n: {
    gu: { q: "Repair પછી એ જ problem પાછો આવ્યો હોવાથી ગ્રાહક ગુસ્સે છે. તમે કેવી રીતે સંભાળશો?" },
    hi: { q: "Repair के बाद वही problem दोबारा आने से ग्राहक ग़ुस्से में है। आप कैसे संभालेंगे?",
          gu: "पहले ग्राहक को शांति से पूरा सुनता हूँ और बीच में बहस नहीं करता। तकलीफ़ हुई इसके लिए माफ़ी माँगता हूँ। फिर विस्तार से पूछता हूँ कि समस्या कब और किस हालत में दोबारा आई। उसके बाद गाड़ी ख़ुद जाँचता हूँ और ज़रूरत हो तो ग्राहक को साथ लेकर test drive लेता हूँ, ताकि असली समस्या समझ में आए। फिर senior या supervisor को बताता हूँ। ग्राहक को साफ़ बताता हूँ कि क्या ख़राबी है, कितना समय लगेगा, और काम पूरा होने तक update देता रहता हूँ। मेरी ग़लती हो तो स्वीकार करके सुधार देता हूँ।",
          tip: "इस सवाल में तकनीकी ज्ञान नहीं, व्यवहार देखा जाता है। «शांति से सुनता हूँ» से शुरू कीजिए और बहस की बात मत कीजिए।" },
    en: { tip: "This question tests behaviour, not technical knowledge. Start with 'I listen calmly' and never mention arguing back." }
  },
  kw: [["listen", "calm", "calmly", "patient", "patiently", "sorry", "apolog"], ["ask", "understand", "detail", "when", "what", "explain"], ["check", "inspect", "test drive", "verify", "again", "diagnose"], ["supervisor", "senior", "manager", "inform", "help"], ["solve", "repair", "free", "properly", "time", "update", "inform", "confidence", "satisfy"]],
  gu: "પહેલાં ગ્રાહકને શાંતિથી પૂરું સાંભળું છું અને વચ્ચે દલીલ કરતો નથી. તકલીફ થઈ તે માટે માફી માંગું છું. પછી વિગતે પૂછું છું કે સમસ્યા ક્યારે અને કઈ સ્થિતિમાં ફરી આવી. ત્યાર બાદ ગાડી જાતે તપાસું છું અને જરૂર પડે તો ગ્રાહકને સાથે રાખીને ટેસ્ટ ડ્રાઇવ લઉં છું, જેથી સાચી સમસ્યા સમજાય. પછી સિનિયર કે સુપરવાઇઝરને જાણ કરું છું. ગ્રાહકને સ્પષ્ટ કહું છું કે શું ખરાબી છે, કેટલો સમય લાગશે, અને કામ પૂરું થાય ત્યાં સુધી અપડેટ આપતો રહું છું. મારી ભૂલ હોય તો સ્વીકારીને સુધારી આપું છું.",
  en: "First I listen to the customer calmly and completely without arguing. I apologise for the inconvenience. Then I ask in detail when and in what condition the problem came back. After that I check the vehicle myself, and if needed I take a test drive with the customer so that I understand the real problem. Then I inform my senior or supervisor. I clearly tell the customer what the fault is and how much time it will take, and I keep giving updates until the work is finished. If it was my mistake I accept it and correct it.",
  tip: "આ પ્રશ્નમાં તકનીકી જ્ઞાન નહીં, વર્તન જોવાય છે. «શાંતિથી સાંભળું છું» થી શરૂ કરો અને દલીલ કરવાની વાત ન કરો."
}
]});
