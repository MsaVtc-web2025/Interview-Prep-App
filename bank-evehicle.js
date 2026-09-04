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
  kw: [["battery", "battery pack", "cell"], ["motor", "electric motor", "traction motor"], ["controller", "control unit", "inverter", "converter", "mcu"], ["charger", "charging", "port", "socket"], ["bms", "battery management", "dc dc", "wiring", "harness", "throttle", "accelerator"]],
  gu: "ઇલેક્ટ્રિક વાહનના મુખ્ય ભાગો આ છે. પહેલો, બેટરી પૅક — જે વીજળી સંગ્રહે છે. બીજો, ઇલેક્ટ્રિક મોટર — જે વીજળીને ગતિમાં બદલે છે. ત્રીજો, કંટ્રોલર કે ઇન્વર્ટર — જે બેટરીથી મોટર સુધી જતી વીજળી નિયંત્રિત કરે છે અને ઍક્સેલરેટર પ્રમાણે ઝડપ નક્કી કરે છે. ચોથો, BMS એટલે બેટરી મેનેજમેન્ટ સિસ્ટમ — જે બેટરીનું વોલ્ટેજ, કરંટ અને તાપમાન સંભાળે છે. પાંચમો, ઓન-બોર્ડ ચાર્જર અને ચાર્જિંગ પોર્ટ. તેની સાથે DC-DC કન્વર્ટર લાઇટ અને હોર્ન જેવાં ૧૨ વોલ્ટનાં સાધનો ચલાવે છે.",
  en: "The main parts of an electric vehicle are these. First, the battery pack, which stores the electricity. Second, the electric motor, which converts electricity into motion. Third, the controller or inverter, which controls the electricity going from the battery to the motor and decides the speed according to the accelerator. Fourth, the BMS, which means Battery Management System, and it looks after the battery voltage, current and temperature. Fifth, the on-board charger and the charging port. Along with these, a DC to DC converter runs the twelve volt parts like the lights and the horn.",
  tip: "BMS નું પૂરું નામ બોલો. ઇ-વ્હીકલના ઇન્ટરવ્યુમાં આ શબ્દ સૌથી વધુ પુછાય છે."
},
{
  id: 2,
  cat: "સલામતી",
  q: "What safety precautions are needed while working on a high voltage EV battery?",
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
  kw: [["battery management system", "bms"], ["voltage", "current", "cell", "monitor", "monitoring", "watch"], ["temperature", "temp", "heat", "overheat", "thermal"], ["overcharge", "over charge", "deep discharge", "over discharge", "protect", "protection", "cut off"], ["balance", "balancing", "life", "safe", "safety", "fire"]],
  gu: "BMS એટલે બેટરી મેનેજમેન્ટ સિસ્ટમ. બેટરી પૅકમાં સેંકડો સેલ હોય છે અને BMS દરેક સેલનું વોલ્ટેજ, કરંટ અને તાપમાન સતત તપાસે છે. તેનું કામ બેટરીને ઓવરચાર્જ અને ઓવર-ડિસ્ચાર્જથી બચાવવાનું, વધુ ગરમ થાય તો કરંટ ઘટાડવાનું કે કાપી નાખવાનું, અને બધા સેલનું વોલ્ટેજ સરખું રાખવાનું — એટલે સેલ બેલેન્સિંગ — છે. BMS બેટરીની ચાર્જિંગ સ્થિતિ પણ બતાવે છે. BMS વગર બેટરી જલદી બગડે અને આગ લાગવાનું જોખમ પણ રહે.",
  en: "BMS means Battery Management System. A battery pack has hundreds of cells, and the BMS continuously checks the voltage, current and temperature of every cell. Its job is to protect the battery from overcharging and deep discharging, to reduce or cut the current if it gets too hot, and to keep all the cell voltages equal, which is called cell balancing. The BMS also shows the state of charge of the battery. Without a BMS the battery would fail quickly and there would also be a risk of fire.",
  tip: "«સેલ બેલેન્સિંગ» અને «ઓવરચાર્જથી બચાવે» એ બે મુદ્દા જરૂર બોલો."
},
{
  id: 4,
  cat: "ચાર્જિંગ",
  q: "What is the difference between AC charging and DC fast charging?",
  kw: [["ac charging", "ac", "alternating"], ["dc", "dc fast", "fast charging", "direct"], ["on board charger", "onboard", "on-board", "inside", "vehicle", "convert", "converts"], ["slow", "slower", "hour", "hours", "overnight", "home"], ["fast", "quick", "minute", "minutes", "station", "heat", "battery life", "expensive", "external"]],
  gu: "AC ચાર્જિંગમાં ઘરના કે સ્ટેશનના AC સપ્લાયથી વીજળી આવે છે, અને વાહનની અંદરનું ઓન-બોર્ડ ચાર્જર તેને DC માં બદલીને બેટરીમાં ભરે છે. ઓન-બોર્ડ ચાર્જર નાનું હોય, તેથી ચાર્જિંગ ધીમું થાય — ચારથી આઠ કલાક લાગે. તે ઘરે રાત્રે ચાર્જ કરવા માટે સારું છે. DC ફાસ્ટ ચાર્જિંગમાં ચાર્જિંગ સ્ટેશનનું મોટું મશીન જ AC ને DC માં બદલી નાખે છે અને સીધો DC બેટરીમાં આપે છે, તેથી ઓન-બોર્ડ ચાર્જરની મર્યાદા નડતી નથી. તેમાં ૩૦ થી ૬૦ મિનિટમાં ચાર્જ થઈ જાય, પણ બેટરી વધુ ગરમ થાય અને વારંવાર વાપરવાથી બેટરીની ઉંમર થોડી ઘટે.",
  en: "In AC charging the electricity comes from the home or station AC supply, and the on-board charger inside the vehicle converts it into DC and fills the battery. The on-board charger is small, so charging is slow and takes about four to eight hours. It is good for charging at home overnight. In DC fast charging the big machine at the charging station itself converts AC into DC and gives DC directly to the battery, so the limit of the on-board charger does not apply. It can charge in thirty to sixty minutes, but the battery gets hotter and using it very often reduces the battery life a little.",
  tip: "«ઓન-બોર્ડ ચાર્જર» એ મુખ્ય ભેદ છે — AC માં અંદરનું ચાર્જર કન્વર્ટ કરે, DC માં બહારનું મશીન. આ સ્પષ્ટ બોલો."
},
{
  id: 5,
  cat: "મોટર",
  q: "Why is an electric motor better than a petrol engine for a vehicle?",
  kw: [["torque", "instant torque", "instant", "pickup", "immediately", "start"], ["efficient", "efficiency", "less loss", "more efficient"], ["part", "parts", "moving part", "less part", "maintenance", "service", "simple"], ["noise", "sound", "silent", "quiet", "vibration", "smooth"], ["pollution", "smoke", "emission", "gas", "clean", "environment"]],
  gu: "ઇલેક્ટ્રિક મોટરમાં શરૂઆતથી જ પૂરો ટોર્ક મળે છે, તેથી પિકઅપ સારો આવે અને ગિયર બદલવાની જરૂર રહેતી નથી. મોટરની કાર્યક્ષમતા આશરે ૯૦ ટકા હોય, જ્યારે પેટ્રોલ એન્જિનની આશરે ૨૫ થી ૩૦ ટકા — બાકીની ઊર્જા ગરમીમાં વેડફાય. મોટરમાં ફરતા ભાગ ઘણા ઓછા હોય, તેથી સર્વિસ ખર્ચ ઓછો આવે અને ઓઇલ બદલવાની જરૂર નથી. મોટર લગભગ અવાજ વગર અને વાઇબ્રેશન વગર ચાલે. અને સૌથી મોટો ફાયદો — ચાલતી વખતે ધુમાડો કે પ્રદૂષણ થતું નથી.",
  en: "An electric motor gives full torque right from the start, so the pickup is good and there is no need to change gears. The efficiency of a motor is about ninety percent, while a petrol engine is only about twenty five to thirty percent, and the rest of the energy is wasted as heat. A motor has very few moving parts, so the service cost is low and there is no need to change oil. The motor runs almost without noise and without vibration. And the biggest advantage is that there is no smoke or pollution while running.",
  tip: "«ઇન્સ્ટન્ટ ટોર્ક» અને કાર્યક્ષમતાના આંકડા બોલો. આંકડા સાથેનો જવાબ વધુ મજબૂત લાગે છે."
},
{
  id: 6,
  cat: "સમસ્યા નિવારણ",
  q: "An electric scooter is not moving even though the battery shows full charge. What will you check?",
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
  kw: [["twenty", "eighty", "20", "80", "full", "hundred", "empty", "zero", "percent", "range"], ["fast charging", "dc fast", "avoid", "often", "frequently", "sometimes"], ["heat", "hot", "sun", "shade", "temperature", "cool"], ["original", "genuine", "company", "proper", "recommended", "charger"], ["overnight", "long time", "unplug", "regular", "service", "check", "store"]],
  gu: "બેટરીને સામાન્ય રીતે ૨૦ થી ૮૦ ટકા વચ્ચે રાખવી સૌથી સારું છે. વારંવાર પૂરી ૧૦૦ ટકા ભરવી કે તદ્દન ખાલી થવા દેવી નહીં — તેનાથી બેટરીની ઉંમર ઘટે. DC ફાસ્ટ ચાર્જિંગ જરૂર પડે ત્યારે જ વાપરવું, રોજ નહીં, કારણ કે તેમાં બેટરી વધુ ગરમ થાય. વાહનને સીધા તાપમાં લાંબો સમય ઊભું ન રાખવું, છાંયડામાં પાર્ક કરવું. ચાર્જિંગ માટે કંપનીનું અસલ ચાર્જર જ વાપરવું — સસ્તું નકલી ચાર્જર બેટરી બગાડે અને આગનું જોખમ ઊભું કરે. ચલાવ્યા પછી બેટરી ગરમ હોય તો થોડી ઠંડી પડે પછી ચાર્જ કરવી, અને લાંબા સમય માટે વાહન ન વાપરવાનું હોય તો બેટરી આશરે ૫૦ ટકા ચાર્જ રાખવી.",
  en: "It is best to keep the battery between twenty and eighty percent normally. The customer should not charge it to full hundred percent again and again, and should not let it go completely empty, because that reduces the battery life. DC fast charging should be used only when needed, not daily, because the battery gets very hot. The vehicle should not be left in direct sun for a long time, it should be parked in the shade. Only the original company charger should be used, because a cheap duplicate charger can damage the battery and cause a fire risk. If the battery is hot after riding, it should be allowed to cool a little before charging, and if the vehicle will not be used for a long time the battery should be kept at about fifty percent charge.",
  tip: "«૨૦ થી ૮૦ ટકા» એ સૌથી મહત્ત્વનો આંકડો છે. «અસલ ચાર્જર વાપરવું» પણ જરૂર બોલો."
},
{
  id: 8,
  cat: "સલામતી",
  q: "What will you do if an EV battery starts smoking or catches fire?",
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
  kw: [["brake", "braking", "slow", "release", "accelerator", "deceler"], ["motor", "generator", "reverse", "works as", "acts as"], ["energy", "kinetic", "movement", "motion", "electricity", "electrical"], ["battery", "back", "charge", "stored", "recover", "return"], ["range", "mileage", "save", "increase", "brake pad", "wear", "less"]],
  gu: "રિજનરેટિવ બ્રેકિંગમાં જ્યારે ડ્રાઇવર ઍક્સેલરેટર છોડે કે બ્રેક લગાવે ત્યારે મોટર ઊંધું કામ કરીને જનરેટર બની જાય છે. વાહનની ગતિની ઊર્જા મોટર દ્વારા વીજળીમાં બદલાય છે અને એ વીજળી પાછી બેટરીમાં ભરાય છે. તેના બે ફાયદા છે — બેટરીની રેન્જ થોડી વધે છે, અને બ્રેક પેડ ઓછા વપરાય એટલે તેની ઉંમર વધે છે. સામાન્ય ગાડીમાં આ ઊર્જા ગરમી બનીને વેડફાઈ જાય છે.",
  en: "In regenerative braking, when the driver releases the accelerator or applies the brake, the motor works in reverse and becomes a generator. The movement energy of the vehicle is converted into electricity by the motor, and that electricity goes back into the battery. There are two benefits. The battery range increases a little, and the brake pads are used less so their life increases. In a normal vehicle this energy is simply wasted as heat.",
  tip: "«મોટર જનરેટર બની જાય છે» એ ચાવીરૂપ વાક્ય છે. પછી બે ફાયદા ગણાવો."
},
{
  id: 10,
  cat: "ઉદ્યોગની સમજ",
  q: "Why do you want to work in the electric vehicle industry?",
  kw: [["future", "growing", "growth", "new", "increasing", "demand", "scope"], ["pollution", "environment", "clean", "green", "petrol price", "fuel price", "cost"], ["learn", "learning", "skill", "new technology", "technology", "training", "course"], ["government", "subsidy", "policy", "support", "company", "opportunity", "job"], ["battery", "motor", "interest", "interested", "career", "grow"]],
  gu: "તમારું ખરું કારણ આપો, પણ ઉદ્યોગની સમજ પણ દેખાડો. જેમ કે: «ઇલેક્ટ્રિક વાહનનો ઉદ્યોગ ભારતમાં ખૂબ ઝડપથી વધી રહ્યો છે અને સરકાર પણ તેને પ્રોત્સાહન આપે છે, તેથી આગળ સારી તકો છે. પેટ્રોલના ભાવ અને પ્રદૂષણ બંને વધતાં લોકો EV તરફ વળી રહ્યા છે. મને બેટરી અને મોટરની ટેક્નોલોજીમાં રસ છે અને મેં તેનો કોર્સ પણ કર્યો છે. આ નવી ટેક્નોલોજી છે, તેથી અહીં શીખવાનું ઘણું છે અને હું કંપની સાથે લાંબા સમય સુધી વિકાસ કરી શકું.»",
  en: "The electric vehicle industry is growing very fast in India and the government is also supporting it, so there are good opportunities ahead. Petrol prices and pollution are both increasing, so people are moving towards EVs. I am personally interested in battery and motor technology, and I have completed a course in it. Since this is a new technology there is a lot to learn here, and I can grow with the company for a long time.",
  tip: "ફક્ત «સારો પગાર મળે છે» એમ ન કહો. ઉદ્યોગ કેમ વધી રહ્યો છે તે એક-બે કારણ સાથે સમજાવો."
}
]});
