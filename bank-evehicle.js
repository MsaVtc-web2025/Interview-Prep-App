/* ઇ-વ્હીકલ (ઇલેક્ટ્રિક વાહન) કોર્સ — તકનીકી પ્રશ્ન બેંક
   must = ફરજિયાત સલામતીના મુદ્દા. ચૂકી જાય તો ચેતવણી અને કુલ ગુણ મર્યાદિત. */
registerCourse({
  id: "evehicle",
  name: "ઇ-વ્હીકલ",
  icon: "🔋",
  tagline: "બેટરી, મોટર, ચાર્જિંગ અને હાઇ-વોલ્ટેજ સલામતી",
  mode: "technical",
  questions: [
{
  id: 1,
  cat: "મૂળભૂત",
  q: "What are the main parts of an electric vehicle?",
  i18n: {
    gu: { q: "Electric vehicle ના મુખ્ય parts કયા કયા છે?" },
    hi: { q: "Electric vehicle के मुख्य parts कौन कौन से हैं?",
          gu: "Electric vehicle के मुख्य भाग ये हैं। पहला, battery pack — जो बिजली संग्रह करता है। दूसरा, electric motor — जो बिजली को गति में बदलता है। तीसरा, controller या inverter — जो battery से motor तक जाने वाली बिजली नियंत्रित करता है और accelerator के अनुसार गति तय करता है। चौथा, BMS यानी Battery Management System — जो battery का voltage, current और तापमान संभालता है। पाँचवाँ, on-board charger और charging port। इनके साथ DC-DC converter light और horn जैसे 12 volt के उपकरण चलाता है।",
          tip: "BMS का पूरा नाम बोलिए। EV के interview में यह शब्द सबसे ज़्यादा पूछा जाता है।" },
    en: { tip: "Say what BMS stands for in full. It is the most commonly asked term in EV interviews." }
  },
  kw: [["battery", "battery pack", "cell"], ["motor", "electric motor", "traction motor"], ["controller", "control unit", "inverter", "converter", "mcu"], ["charger", "charging", "port", "socket"], ["bms", "battery management", "dc dc", "wiring", "harness", "throttle", "accelerator"]],
  gu: "ઇલેક્ટ્રિક વાહનના મુખ્ય ભાગો આ છે. પહેલો, બેટરી પૅક — જે વીજળી સંગ્રહે છે. બીજો, ઇલેક્ટ્રિક મોટર — જે વીજળીને ગતિમાં બદલે છે. ત્રીજો, કંટ્રોલર કે ઇન્વર્ટર — જે બેટરીથી મોટર સુધી જતી વીજળી નિયંત્રિત કરે છે અને ઍક્સેલરેટર પ્રમાણે ઝડપ નક્કી કરે છે. ચોથો, BMS એટલે બેટરી મેનેજમેન્ટ સિસ્ટમ — જે બેટરીનું વોલ્ટેજ, કરંટ અને તાપમાન સંભાળે છે. પાંચમો, ઓન-બોર્ડ ચાર્જર અને ચાર્જિંગ પોર્ટ. તેની સાથે DC-DC કન્વર્ટર લાઇટ અને હોર્ન જેવાં ૧૨ વોલ્ટનાં સાધનો ચલાવે છે.",
  en: "The main parts of an electric vehicle are these. First, the battery pack, which stores the electricity. Second, the electric motor, which converts electricity into motion. Third, the controller or inverter, which controls the electricity going from the battery to the motor and decides the speed according to the accelerator. Fourth, the BMS, which means Battery Management System, and it looks after the battery voltage, current and temperature. Fifth, the on-board charger and the charging port. Along with these, a DC to DC converter runs the twelve volt parts like the lights and the horn.",
  tip: "BMS નું પૂરું નામ બોલો. ઇ-વ્હીકલના ઇન્ટરવ્યુમાં આ શબ્દ સૌથી વધુ પુછાય છે."
},
{
  id: 2,
  cat: "સલામતી",
  q: "What safety precautions are needed while working on a high voltage EV battery?",
  i18n: {
    gu: { q: "High voltage EV battery પર કામ કરતી વખતે કઈ safety precautions જરૂરી છે?" },
    hi: { q: "High voltage EV battery पर काम करते समय कौन सी safety precautions ज़रूरी हैं?",
          gu: "EV की battery 48 से 400 volt या उससे ज़्यादा हो सकती है, इसलिए वह जानलेवा है। पहले वाहन बंद करके high voltage service disconnect या main switch निकालकर system अलग करता हूँ। फिर पाँच-दस मिनट रुकता हूँ, ताकि capacitor discharge हो जाएँ। उसके बाद high voltage वाले insulated gloves, face shield और rubber mat इस्तेमाल करता हूँ। फिर multimeter से पक्का करता हूँ कि voltage शून्य है। हाथ से अंगूठी, घड़ी और चेन निकाल देता हूँ और हाथ सूखे रखता हूँ। नारंगी रंग के cable high voltage के होते हैं, उन्हें training के बिना नहीं छूता, और ऐसा काम अकेले नहीं करता।",
          tip: "«Service disconnect निकालना» और «HV gloves पहनना» — ये दो छूट गए तो EV की नौकरी नहीं मिलती। नारंगी cable का ज़िक्र भी कीजिए।" },
    en: { tip: "Removing the service disconnect and wearing HV gloves — miss these two and you will not get an EV job. Mention the orange cables too." }
  },
  kw: [["insulated", "insulating", "class 0", "rubber", "mat", "goggles", "face shield", "helmet"], ["tester", "multimeter", "check", "confirm", "measure", "verify", "zero", "discharge"], ["metal", "ring", "watch", "chain", "jewellery", "jewelry", "remove", "wet", "dry"], ["train", "trained", "certified", "authorised", "authorized", "qualified", "alone", "supervisor"], ["orange", "cable", "high voltage", "hv", "warning", "label", "not touch", "do not touch"]],
  must: [
    { kw: ["switch off", "turn off", "power off", "isolate", "isolation", "service plug", "service disconnect", "disconnect", "main switch", "key off"], gu: "હાઇ-વોલ્ટેજ સર્વિસ ડિસ્કનેક્ટ કાઢીને સિસ્ટમ અલગ કરવી" },
    { kw: ["gloves", "hv gloves", "insulated glove", "rubber glove", "ppe"], gu: "હાઇ-વોલ્ટેજ ઇન્સ્યુલેટેડ ગ્લવ્ઝ પહેરવાં" }
  ],
  gu: "EV ની બેટરી ૪૮ થી ૪૦૦ વોલ્ટ કે વધુ હોય શકે, તેથી તે જીવલેણ છે. પહેલાં વાહન બંધ કરીને હાઇ-વોલ્ટેજ સર્વિસ ડિસ્કનેક્ટ કે મુખ્ય સ્વિચ કાઢીને સિસ્ટમ અલગ કરું છું. પછી પાંચ-દસ મિનિટ રાહ જોઉં છું, જેથી કેપેસિટર ડિસ્ચાર્જ થાય. ત્યાર બાદ હાઇ-વોલ્ટેજ માટેના ઇન્સ્યુલેટેડ ગ્લવ્ઝ, ફેસ શીલ્ડ અને રબર મૅટ વાપરું છું. પછી મલ્ટિમીટરથી ખાતરી કરું છું કે વોલ્ટેજ શૂન્ય છે. હાથમાંથી વીંટી, ઘડિયાળ અને ચેન કાઢી નાખું છું અને હાથ સૂકા રાખું છું. નારંગી રંગના કેબલ હાઇ-વોલ્ટેજના હોય છે, તે તાલીમ વગર અડતો નથી, અને આવું કામ એકલા કરતો નથી.",
  en: "An EV battery can be from forty eight volts to four hundred volts or more, so it can be fatal. First I switch off the vehicle and remove the high voltage service disconnect or main switch to isolate the system. Then I wait for five to ten minutes so that the capacitors discharge. After that I wear high voltage insulated gloves, a face shield and use a rubber mat. Then I confirm with a multimeter that the voltage is zero. I remove my ring, watch and chain and keep my hands dry. The orange coloured cables are high voltage, so I never touch them without training, and I never do this work alone.",
  tip: "«સર્વિસ ડિસ્કનેક્ટ કાઢવો» અને «HV ગ્લવ્ઝ પહેરવાં» — આ બે ચૂકી ગયા તો ઇ-વ્હીકલની નોકરી મળતી નથી. નારંગી કેબલનો ઉલ્લેખ પણ કરો."
},
{
  id: 3,
  cat: "બેટરી",
  q: "What is a BMS and why is it needed?",
  i18n: {
    gu: { q: "BMS શું છે અને તે શા માટે જરૂરી છે?" },
    hi: { q: "BMS क्या है और यह क्यों ज़रूरी है?",
          gu: "BMS यानी Battery Management System। Battery pack में सैकड़ों cell होते हैं और BMS हर cell का voltage, current और तापमान लगातार जाँचता है। उसका काम battery को overcharge और over-discharge से बचाना, ज़्यादा गर्म होने पर current घटाना या काट देना, और सभी cells का voltage बराबर रखना — यानी cell balancing — है। BMS battery की charging स्थिति भी बताता है। BMS के बिना battery जल्दी ख़राब होती है और आग लगने का ख़तरा भी रहता है।",
          tip: "«Cell balancing» और «overcharge से बचाता है» ये दो बातें ज़रूर बोलिए।" },
    en: { tip: "Be sure to say 'cell balancing' and 'it protects against overcharging'." }
  },
  kw: [["battery management system", "bms"], ["voltage", "current", "cell", "monitor", "monitoring", "watch"], ["temperature", "temp", "heat", "overheat", "thermal"], ["overcharge", "over charge", "deep discharge", "over discharge", "protect", "protection", "cut off"], ["balance", "balancing", "life", "safe", "safety", "fire"]],
  gu: "BMS એટલે બેટરી મેનેજમેન્ટ સિસ્ટમ. બેટરી પૅકમાં સેંકડો સેલ હોય છે અને BMS દરેક સેલનું વોલ્ટેજ, કરંટ અને તાપમાન સતત તપાસે છે. તેનું કામ બેટરીને ઓવરચાર્જ અને ઓવર-ડિસ્ચાર્જથી બચાવવાનું, વધુ ગરમ થાય તો કરંટ ઘટાડવાનું કે કાપી નાખવાનું, અને બધા સેલનું વોલ્ટેજ સરખું રાખવાનું — એટલે સેલ બેલેન્સિંગ — છે. BMS બેટરીની ચાર્જિંગ સ્થિતિ પણ બતાવે છે. BMS વગર બેટરી જલદી બગડે અને આગ લાગવાનું જોખમ પણ રહે.",
  en: "BMS means Battery Management System. A battery pack has hundreds of cells, and the BMS continuously checks the voltage, current and temperature of every cell. Its job is to protect the battery from overcharging and deep discharging, to reduce or cut the current if it gets too hot, and to keep all the cell voltages equal, which is called cell balancing. The BMS also shows the state of charge of the battery. Without a BMS the battery would fail quickly and there would also be a risk of fire.",
  tip: "«સેલ બેલેન્સિંગ» અને «ઓવરચાર્જથી બચાવે» એ બે મુદ્દા જરૂર બોલો."
},
{
  id: 4,
  cat: "ચાર્જિંગ",
  q: "What is the difference between AC charging and DC fast charging?",
  i18n: {
    gu: { q: "AC charging અને DC fast charging વચ્ચે શું ફરક છે?" },
    hi: { q: "AC charging और DC fast charging में क्या फ़र्क़ है?",
          gu: "AC charging में घर या station की AC supply से बिजली आती है, और वाहन के अंदर का on-board charger उसे DC में बदलकर battery में भरता है। On-board charger छोटा होता है, इसलिए charging धीमी होती है — चार से आठ घंटे लगते हैं। वह घर पर रात में charge करने के लिए अच्छा है। DC fast charging में charging station की बड़ी मशीन ही AC को DC में बदल देती है और सीधा DC battery को देती है, इसलिए on-board charger की सीमा आड़े नहीं आती। उसमें 30 से 60 मिनट में charge हो जाता है, पर battery ज़्यादा गर्म होती है और बार-बार इस्तेमाल से battery की उम्र थोड़ी घटती है।",
          tip: "«On-board charger» यही मुख्य फ़र्क़ है — AC में अंदर का charger बदलता है, DC में बाहर की मशीन। यह साफ़ बोलिए।" },
    en: { tip: "The on-board charger is the key difference — in AC the charger inside converts, in DC the machine outside does. State that clearly." }
  },
  kw: [["ac charging", "ac", "alternating"], ["dc", "dc fast", "fast charging", "direct"], ["on board charger", "onboard", "on-board", "inside", "vehicle", "convert", "converts"], ["slow", "slower", "hour", "hours", "overnight", "home"], ["fast", "quick", "minute", "minutes", "station", "heat", "battery life", "expensive", "external"]],
  gu: "AC ચાર્જિંગમાં ઘરના કે સ્ટેશનના AC સપ્લાયથી વીજળી આવે છે, અને વાહનની અંદરનું ઓન-બોર્ડ ચાર્જર તેને DC માં બદલીને બેટરીમાં ભરે છે. ઓન-બોર્ડ ચાર્જર નાનું હોય, તેથી ચાર્જિંગ ધીમું થાય — ચારથી આઠ કલાક લાગે. તે ઘરે રાત્રે ચાર્જ કરવા માટે સારું છે. DC ફાસ્ટ ચાર્જિંગમાં ચાર્જિંગ સ્ટેશનનું મોટું મશીન જ AC ને DC માં બદલી નાખે છે અને સીધો DC બેટરીમાં આપે છે, તેથી ઓન-બોર્ડ ચાર્જરની મર્યાદા નડતી નથી. તેમાં ૩૦ થી ૬૦ મિનિટમાં ચાર્જ થઈ જાય, પણ બેટરી વધુ ગરમ થાય અને વારંવાર વાપરવાથી બેટરીની ઉંમર થોડી ઘટે.",
  en: "In AC charging the electricity comes from the home or station AC supply, and the on-board charger inside the vehicle converts it into DC and fills the battery. The on-board charger is small, so charging is slow and takes about four to eight hours. It is good for charging at home overnight. In DC fast charging the big machine at the charging station itself converts AC into DC and gives DC directly to the battery, so the limit of the on-board charger does not apply. It can charge in thirty to sixty minutes, but the battery gets hotter and using it very often reduces the battery life a little.",
  tip: "«ઓન-બોર્ડ ચાર્જર» એ મુખ્ય ભેદ છે — AC માં અંદરનું ચાર્જર કન્વર્ટ કરે, DC માં બહારનું મશીન. આ સ્પષ્ટ બોલો."
},
{
  id: 5,
  cat: "મોટર",
  q: "Why is an electric motor better than a petrol engine for a vehicle?",
  i18n: {
    gu: { q: "વાહન માટે petrol engine કરતાં electric motor શા માટે વધુ સારી છે?" },
    hi: { q: "गाड़ी के लिए petrol engine से electric motor बेहतर क्यों है?",
          gu: "Electric motor में शुरू से ही पूरा torque मिलता है, इसलिए pickup अच्छा आता है और gear बदलने की ज़रूरत नहीं रहती। Motor की efficiency लगभग 90 प्रतिशत होती है, जबकि petrol engine की लगभग 25 से 30 प्रतिशत — बाक़ी ऊर्जा गर्मी में बर्बाद हो जाती है। Motor में घूमने वाले भाग बहुत कम होते हैं, इसलिए service का ख़र्च कम आता है और oil बदलने की ज़रूरत नहीं। Motor लगभग बिना आवाज़ और बिना vibration के चलती है। और सबसे बड़ा फ़ायदा — चलते समय धुआँ या प्रदूषण नहीं होता।",
          tip: "«Instant torque» और efficiency के आँकड़े बोलिए। आँकड़ों के साथ जवाब ज़्यादा मज़बूत लगता है।" },
    en: { tip: "Say 'instant torque' and quote the efficiency figures. Numbers make the answer much stronger." }
  },
  kw: [["torque", "instant torque", "instant", "pickup", "immediately", "start"], ["efficient", "efficiency", "less loss", "more efficient"], ["part", "parts", "moving part", "less part", "maintenance", "service", "simple"], ["noise", "sound", "silent", "quiet", "vibration", "smooth"], ["pollution", "smoke", "emission", "gas", "clean", "environment"]],
  gu: "ઇલેક્ટ્રિક મોટરમાં શરૂઆતથી જ પૂરો ટોર્ક મળે છે, તેથી પિકઅપ સારો આવે અને ગિયર બદલવાની જરૂર રહેતી નથી. મોટરની કાર્યક્ષમતા આશરે ૯૦ ટકા હોય, જ્યારે પેટ્રોલ એન્જિનની આશરે ૨૫ થી ૩૦ ટકા — બાકીની ઊર્જા ગરમીમાં વેડફાય. મોટરમાં ફરતા ભાગ ઘણા ઓછા હોય, તેથી સર્વિસ ખર્ચ ઓછો આવે અને ઓઇલ બદલવાની જરૂર નથી. મોટર લગભગ અવાજ વગર અને વાઇબ્રેશન વગર ચાલે. અને સૌથી મોટો ફાયદો — ચાલતી વખતે ધુમાડો કે પ્રદૂષણ થતું નથી.",
  en: "An electric motor gives full torque right from the start, so the pickup is good and there is no need to change gears. The efficiency of a motor is about ninety percent, while a petrol engine is only about twenty five to thirty percent, and the rest of the energy is wasted as heat. A motor has very few moving parts, so the service cost is low and there is no need to change oil. The motor runs almost without noise and without vibration. And the biggest advantage is that there is no smoke or pollution while running.",
  tip: "«ઇન્સ્ટન્ટ ટોર્ક» અને કાર્યક્ષમતાના આંકડા બોલો. આંકડા સાથેનો જવાબ વધુ મજબૂત લાગે છે."
},
{
  id: 6,
  cat: "સમસ્યા નિવારણ",
  q: "An electric scooter is not moving even though the battery shows full charge. What will you check?",
  i18n: {
    gu: { q: "Battery full charge બતાવે છે છતાં electric scooter ચાલતું નથી. તમે શું તપાસશો?" },
    hi: { q: "Battery full charge दिखा रही है फिर भी electric scooter नहीं चल रहा। आप क्या जाँचेंगे?",
          gu: "पहले power बंद करके सुरक्षा के साथ काम शुरू करता हूँ। फिर display पर कोई error code दिख रहा है या नहीं यह देखता हूँ, क्योंकि उससे सीधा संकेत मिल जाता है। फिर आसान बातें जाँचता हूँ — side stand ऊपर है या नहीं, brake cut-off switch दबी तो नहीं है, और ride mode सही है या नहीं। फिर throttle या accelerator का sensor जाँचता हूँ, क्योंकि वह आम ख़राबी है। फिर controller तक के connector ढीले नहीं हैं और fuse उड़ा नहीं है यह देखता हूँ। आख़िर में motor की winding और BMS का output multimeter से जाँचता हूँ।",
          tip: "«Side stand» और «brake cut-off switch» — ये आसान कारण पहले बोलने से व्यावहारिक समझ दिखती है।" },
    en: { tip: "Naming the side stand and brake cut-off switch first shows practical sense — check the simple things before the expensive ones." }
  },
  kw: [["key", "switch", "on", "ignition", "power"], ["throttle", "accelerator", "sensor", "hall", "grip"], ["controller", "connector", "connection", "loose", "wire", "wiring", "harness", "fuse"], ["brake", "brake switch", "cut off", "cutoff", "side stand", "stand", "lock", "mode"], ["motor", "error", "code", "display", "bms", "test", "check", "multimeter"]],
  must: [{ kw: ["switch off", "off", "isolate", "disconnect", "safety", "gloves", "before"], gu: "તપાસ પહેલાં પાવર બંધ કરવો" }],
  gu: "પહેલાં પાવર બંધ કરીને સલામતી સાથે કામ શરૂ કરું છું. પછી ડિસ્પ્લે પર કોઈ એરર કોડ દેખાય છે કે નહીં તે જોઉં છું, કારણ કે તેમાંથી સીધો સંકેત મળે. પછી સહેલી બાબતો તપાસું છું — સાઇડ સ્ટૅન્ડ ઉપર છે કે નહીં, બ્રેક કટ-ઓફ સ્વિચ દબાયેલી નથી ને, અને રાઇડ મોડ સાચો છે કે નહીં. પછી થ્રોટલ કે ઍક્સેલરેટરનો સેન્સર ચકાસું છું, કારણ કે એ સામાન્ય ખરાબી છે. પછી કંટ્રોલર સુધીના કનેક્ટર ઢીલા નથી અને ફ્યુઝ ઉડ્યો નથી તે જોઉં છું. છેલ્લે મોટરની વાઇન્ડિંગ અને BMS નું આઉટપુટ મલ્ટિમીટરથી તપાસું છું.",
  en: "First I switch off the power and start the work safely. Then I check whether any error code is showing on the display, because that gives a direct clue. Next I check the easy things, whether the side stand is up, whether the brake cut-off switch is stuck pressed, and whether the correct ride mode is selected. Then I check the throttle or accelerator sensor, because that is a common fault. After that I check that the connectors up to the controller are not loose and the fuse is not blown. Finally I check the motor winding and the BMS output with a multimeter.",
  tip: "«સાઇડ સ્ટૅન્ડ» અને «બ્રેક કટ-ઓફ સ્વિચ» — આ સહેલાં કારણો પહેલાં બોલવાથી વ્યવહારુ સમજ દેખાય છે."
},
{
  id: 7,
  cat: "બેટરી સંભાળ",
  q: "How should a customer take care of an EV battery to make it last longer?",
  i18n: {
    gu: { q: "EV battery લાંબો સમય ચાલે તે માટે ગ્રાહકે તેની કેવી સંભાળ રાખવી જોઈએ?" },
    hi: { q: "EV battery ज़्यादा समय चले इसके लिए ग्राहक को उसकी देखभाल कैसे करनी चाहिए?",
          gu: "Battery को आम तौर पर 20 से 80 प्रतिशत के बीच रखना सबसे अच्छा है। बार-बार पूरी 100 प्रतिशत भरना या बिलकुल ख़ाली होने देना नहीं चाहिए — इससे battery की उम्र घटती है। DC fast charging ज़रूरत पड़ने पर ही इस्तेमाल कीजिए, रोज़ नहीं, क्योंकि उसमें battery ज़्यादा गर्म होती है। वाहन को सीधी धूप में लंबे समय तक खड़ा मत रखिए, छाँव में park कीजिए। Charging के लिए कंपनी का असली charger ही इस्तेमाल कीजिए — सस्ता नक़ली charger battery ख़राब करता है और आग का ख़तरा पैदा करता है। चलाने के बाद battery गर्म हो तो थोड़ी ठंडी होने के बाद charge कीजिए, और लंबे समय तक वाहन न चलाना हो तो battery लगभग 50 प्रतिशत charge रखिए।",
          tip: "«20 से 80 प्रतिशत» सबसे अहम आँकड़ा है। «असली charger इस्तेमाल कीजिए» भी ज़रूर बोलिए।" },
    en: { tip: "'Twenty to eighty per cent' is the figure that matters most. Also be sure to say 'use the genuine charger'." }
  },
  kw: [["twenty", "eighty", "20", "80", "full", "hundred", "empty", "zero", "percent", "range"], ["fast charging", "dc fast", "avoid", "often", "frequently", "sometimes"], ["heat", "hot", "sun", "shade", "temperature", "cool"], ["original", "genuine", "company", "proper", "recommended", "charger"], ["overnight", "long time", "unplug", "regular", "service", "check", "store"]],
  gu: "બેટરીને સામાન્ય રીતે ૨૦ થી ૮૦ ટકા વચ્ચે રાખવી સૌથી સારું છે. વારંવાર પૂરી ૧૦૦ ટકા ભરવી કે તદ્દન ખાલી થવા દેવી નહીં — તેનાથી બેટરીની ઉંમર ઘટે. DC ફાસ્ટ ચાર્જિંગ જરૂર પડે ત્યારે જ વાપરવું, રોજ નહીં, કારણ કે તેમાં બેટરી વધુ ગરમ થાય. વાહનને સીધા તાપમાં લાંબો સમય ઊભું ન રાખવું, છાંયડામાં પાર્ક કરવું. ચાર્જિંગ માટે કંપનીનું અસલ ચાર્જર જ વાપરવું — સસ્તું નકલી ચાર્જર બેટરી બગાડે અને આગનું જોખમ ઊભું કરે. ચલાવ્યા પછી બેટરી ગરમ હોય તો થોડી ઠંડી પડે પછી ચાર્જ કરવી, અને લાંબા સમય માટે વાહન ન વાપરવાનું હોય તો બેટરી આશરે ૫૦ ટકા ચાર્જ રાખવી.",
  en: "It is best to keep the battery between twenty and eighty percent normally. The customer should not charge it to full hundred percent again and again, and should not let it go completely empty, because that reduces the battery life. DC fast charging should be used only when needed, not daily, because the battery gets very hot. The vehicle should not be left in direct sun for a long time, it should be parked in the shade. Only the original company charger should be used, because a cheap duplicate charger can damage the battery and cause a fire risk. If the battery is hot after riding, it should be allowed to cool a little before charging, and if the vehicle will not be used for a long time the battery should be kept at about fifty percent charge.",
  tip: "«૨૦ થી ૮૦ ટકા» એ સૌથી મહત્ત્વનો આંકડો છે. «અસલ ચાર્જર વાપરવું» પણ જરૂર બોલો."
},
{
  id: 8,
  cat: "સલામતી",
  q: "What will you do if an EV battery starts smoking or catches fire?",
  i18n: {
    gu: { q: "EV battery માંથી ધુમાડો નીકળે કે આગ લાગે તો તમે શું કરશો?" },
    hi: { q: "EV battery से धुआँ निकलने लगे या आग लग जाए तो आप क्या करेंगे?",
          gu: "Lithium battery की आग सामान्य आग से अलग और बहुत ख़तरनाक होती है — उसमें ज़हरीला धुआँ निकलता है और आग अपने आप फैलती रहती है, जिसे thermal runaway कहते हैं। पहले सब लोगों को दूर करता हूँ और ख़ुद भी सुरक्षित दूरी पर चला जाता हूँ। धुआँ साँस में नहीं लेता। तुरंत fire brigade को 101 या 112 पर बुलाता हूँ और बताता हूँ कि यह lithium battery की आग है। छोटे extinguisher से बुझाने की कोशिश नहीं करता, क्योंकि वह काफ़ी नहीं होता। बहुत ज़्यादा पानी हो तो battery ठंडी करने के लिए इस्तेमाल होता है, पर वह काम training पाए लोगों का है। आग बुझने के बाद भी battery घंटों तक दोबारा जल सकती है, इसलिए उसे निगरानी में खुली जगह पर रखना पड़ता है।",
          tip: "«Thermal runaway» और «आग दोबारा लग सकती है» ये दो बातें बोलने से असली training दिखती है। «ख़ुद बुझा दूँगा» कभी मत कहिए।" },
    en: { tip: "Saying 'thermal runaway' and 'it can reignite' shows real training. Never say you would put it out yourself." }
  },
  kw: [["evacuate", "away", "far", "distance", "people", "clear", "move away", "crowd"], ["fire brigade", "brigade", "101", "112", "emergency", "call", "inform", "help"], ["water", "lot of water", "large", "cool", "cooling"], ["not", "do not", "never", "small", "normal", "extinguisher", "abc", "co2", "powder"], ["reignite", "again", "restart", "hours", "watch", "monitor", "battery fire", "thermal", "runaway"]],
  must: [
    { kw: ["away", "evacuate", "distance", "far", "move away", "leave", "clear", "not near", "do not go"], gu: "લોકોને દૂર કરવા અને પોતે દૂર રહેવું" },
    { kw: ["fire brigade", "brigade", "101", "112", "emergency", "call", "professional", "trained"], gu: "ફાયર બ્રિગેડને બોલાવવી" }
  ],
  gu: "લિથિયમ બેટરીની આગ સામાન્ય આગ કરતાં જુદી અને ખૂબ ખતરનાક હોય છે — તેમાં ઝેરી ધુમાડો નીકળે છે અને આગ જાતે ફેલાતી રહે છે, જેને થર્મલ રનઅવે કહે છે. પહેલાં બધા લોકોને દૂર કરું છું અને પોતે પણ સુરક્ષિત અંતરે જતો રહું છું. ધુમાડો શ્વાસમાં લેતો નથી. તરત ફાયર બ્રિગેડને ૧૦૧ કે ૧૧૨ પર બોલાવું છું અને જણાવું છું કે તે લિથિયમ બેટરીની આગ છે. નાના એક્સ્ટિંગ્વિશરથી બુઝાવવાની કોશિશ કરતો નથી, કારણ કે તે પૂરતું નથી. મોટા પ્રમાણમાં પાણી હોય તો બેટરી ઠંડી પાડવા વપરાય છે, પણ એ કામ તાલીમ પામેલા લોકોનું છે. આગ બુઝાયા પછી પણ બેટરી કલાકો સુધી ફરી સળગી શકે, તેથી તેને દેખરેખ હેઠળ ખુલ્લી જગ્યાએ રાખવી પડે.",
  en: "A lithium battery fire is different from a normal fire and it is very dangerous, because it gives off poisonous smoke and the fire keeps spreading by itself, which is called thermal runaway. First I move all the people away and I also go to a safe distance. I do not breathe the smoke. I immediately call the fire brigade on 101 or 112 and tell them that it is a lithium battery fire. I do not try to put it out with a small extinguisher, because that is not enough. A large quantity of water is used to cool the battery, but that work should be done by trained people. Even after the fire is out, the battery can catch fire again for many hours, so it has to be kept in an open area under watch.",
  tip: "«થર્મલ રનઅવે» અને «આગ ફરી લાગી શકે» એ બે મુદ્દા બોલવાથી ખરી તાલીમ દેખાય છે. «જાતે બુઝાવીશ» એવું કદી ન કહો."
},
{
  id: 9,
  cat: "તકનીકી સમજ",
  q: "What is regenerative braking?",
  i18n: {
    gu: { q: "Regenerative braking શું છે?" },
    hi: { q: "Regenerative braking क्या है?",
          gu: "Regenerative braking में जब driver accelerator छोड़ता है या brake लगाता है तो motor उल्टा काम करके generator बन जाती है। वाहन की गति की ऊर्जा motor के ज़रिए बिजली में बदलती है और वह बिजली वापस battery में भर जाती है। इसके दो फ़ायदे हैं — battery की range थोड़ी बढ़ती है, और brake pad कम घिसते हैं इसलिए उनकी उम्र बढ़ती है। सामान्य गाड़ी में यह ऊर्जा गर्मी बनकर बर्बाद हो जाती है।",
          tip: "«Motor generator बन जाती है» यही कुंजी वाक्य है। फिर दो फ़ायदे गिनाइए।" },
    en: { tip: "'The motor becomes a generator' is the key sentence. Then list the two benefits." }
  },
  kw: [["brake", "braking", "slow", "release", "accelerator", "deceler"], ["motor", "generator", "reverse", "works as", "acts as"], ["energy", "kinetic", "movement", "motion", "electricity", "electrical"], ["battery", "back", "charge", "stored", "recover", "return"], ["range", "mileage", "save", "increase", "brake pad", "wear", "less"]],
  gu: "રિજનરેટિવ બ્રેકિંગમાં જ્યારે ડ્રાઇવર ઍક્સેલરેટર છોડે કે બ્રેક લગાવે ત્યારે મોટર ઊંધું કામ કરીને જનરેટર બની જાય છે. વાહનની ગતિની ઊર્જા મોટર દ્વારા વીજળીમાં બદલાય છે અને એ વીજળી પાછી બેટરીમાં ભરાય છે. તેના બે ફાયદા છે — બેટરીની રેન્જ થોડી વધે છે, અને બ્રેક પેડ ઓછા વપરાય એટલે તેની ઉંમર વધે છે. સામાન્ય ગાડીમાં આ ઊર્જા ગરમી બનીને વેડફાઈ જાય છે.",
  en: "In regenerative braking, when the driver releases the accelerator or applies the brake, the motor works in reverse and becomes a generator. The movement energy of the vehicle is converted into electricity by the motor, and that electricity goes back into the battery. There are two benefits. The battery range increases a little, and the brake pads are used less so their life increases. In a normal vehicle this energy is simply wasted as heat.",
  tip: "«મોટર જનરેટર બની જાય છે» એ ચાવીરૂપ વાક્ય છે. પછી બે ફાયદા ગણાવો."
},
{
  id: 10,
  cat: "ઉદ્યોગની સમજ",
  q: "Why do you want to work in the electric vehicle industry?",
  i18n: {
    gu: { q: "તમે electric vehicle industry માં કેમ કામ કરવા માંગો છો?" },
    hi: { q: "आप electric vehicle industry में क्यों काम करना चाहते हैं?",
          gu: "अपना असली कारण बताइए, पर उद्योग की समझ भी दिखाइए। जैसे: «Electric vehicle का उद्योग भारत में बहुत तेज़ी से बढ़ रहा है और सरकार भी उसे बढ़ावा दे रही है, इसलिए आगे अच्छे मौक़े हैं। Petrol के दाम और प्रदूषण दोनों बढ़ने से लोग EV की ओर जा रहे हैं। मुझे battery और motor की technology में रुचि है और मैंने उसका course भी किया है। यह नई technology है, इसलिए यहाँ सीखने को बहुत है और मैं कंपनी के साथ लंबे समय तक आगे बढ़ सकता हूँ।»",
          tip: "सिर्फ़ «अच्छी तनख़्वाह मिलती है» मत कहिए। उद्योग क्यों बढ़ रहा है, यह एक-दो कारणों के साथ समझाइए।" },
    en: { tip: "Do not just say 'the pay is good'. Explain why the industry is growing, with one or two concrete reasons." }
  },
  kw: [["future", "growing", "growth", "new", "increasing", "demand", "scope"], ["pollution", "environment", "clean", "green", "petrol price", "fuel price", "cost"], ["learn", "learning", "skill", "new technology", "technology", "training", "course"], ["government", "subsidy", "policy", "support", "company", "opportunity", "job"], ["battery", "motor", "interest", "interested", "career", "grow"]],
  gu: "તમારું ખરું કારણ આપો, પણ ઉદ્યોગની સમજ પણ દેખાડો. જેમ કે: «ઇલેક્ટ્રિક વાહનનો ઉદ્યોગ ભારતમાં ખૂબ ઝડપથી વધી રહ્યો છે અને સરકાર પણ તેને પ્રોત્સાહન આપે છે, તેથી આગળ સારી તકો છે. પેટ્રોલના ભાવ અને પ્રદૂષણ બંને વધતાં લોકો EV તરફ વળી રહ્યા છે. મને બેટરી અને મોટરની ટેક્નોલોજીમાં રસ છે અને મેં તેનો કોર્સ પણ કર્યો છે. આ નવી ટેક્નોલોજી છે, તેથી અહીં શીખવાનું ઘણું છે અને હું કંપની સાથે લાંબા સમય સુધી વિકાસ કરી શકું.»",
  en: "The electric vehicle industry is growing very fast in India and the government is also supporting it, so there are good opportunities ahead. Petrol prices and pollution are both increasing, so people are moving towards EVs. I am personally interested in battery and motor technology, and I have completed a course in it. Since this is a new technology there is a lot to learn here, and I can grow with the company for a long time.",
  tip: "ફક્ત «સારો પગાર મળે છે» એમ ન કહો. ઉદ્યોગ કેમ વધી રહ્યો છે તે એક-બે કારણ સાથે સમજાવો."
}
]});
