/* ઇલેક્ટ્રિશિયન કોર્સ — તકનીકી પ્રશ્ન બેંક
   must = ફરજિયાત સલામતીના મુદ્દા. ચૂકી જાય તો ચેતવણી અને કુલ ગુણ મર્યાદિત. */
registerCourse({
  id: "electrician",
  name: "ઇલેક્ટ્રિશિયન",
  icon: "⚡",
  tagline: "વાયરિંગ, સલામતી અને સમસ્યા નિવારણ",
  mode: "technical",
  questions: [
{
  id: 1,
  cat: "સલામતી",
  q: "What safety precautions do you take before working on an electrical panel?",
  kw: [["tester", "test", "check", "multimeter", "voltage", "dead", "confirm"], ["gloves", "shoes", "insulated", "rubber", "ppe", "helmet", "mat"], ["tool", "insulated tool", "dry", "hand"], ["inform", "supervisor", "tell", "permission", "team"], ["tag", "lock", "notice", "board", "sign"]],
  must: [
    { kw: ["switch off", "switched off", "turn off", "power off", "isolate", "isolation", "main off", "breaker off", "supply off"], gu: "મુખ્ય સપ્લાય બંધ કરવો" },
    { kw: ["tester", "test", "confirm", "check", "multimeter", "verify"], gu: "ટેસ્ટરથી કરંટ નથી તે ખાતરી કરવી" }
  ],
  gu: "સૌથી પહેલાં મુખ્ય સ્વિચ કે બ્રેકર બંધ કરીને સપ્લાય કાપું છું. પછી પેનલ પર «કામ ચાલુ છે» એવું ટૅગ કે લોક લગાવું છું, જેથી બીજું કોઈ ચાલુ ન કરે. ત્યાર બાદ ટેસ્ટર કે મલ્ટિમીટરથી ખાતરી કરું છું કે ખરેખર કરંટ નથી. પછી ઇન્સ્યુલેટેડ ગ્લવ્ઝ, રબર શૂઝ અને ઇન્સ્યુલેટેડ ટૂલ વાપરું છું, અને હાથ સૂકા રાખું છું. કામ શરૂ કરતાં પહેલાં સુપરવાઇઝરને જાણ કરું છું.",
  en: "First I switch off the main switch or breaker to cut the supply. Then I put a tag or a lock on the panel so that nobody else switches it on. After that I use a tester or a multimeter to confirm that there is really no current. Then I wear insulated gloves and rubber shoes, use insulated tools, and keep my hands dry. I also inform my supervisor before starting the work.",
  tip: "«સપ્લાય બંધ કરવો» અને «ટેસ્ટરથી ખાતરી કરવી» — આ બે ચૂકી ગયા તો ઇન્ટરવ્યુમાં તરત નકારાય છે."
},
{
  id: 2,
  cat: "મૂળભૂત",
  q: "What is the difference between earthing and neutral?",
  kw: [["neutral", "return"], ["earth", "earthing", "ground", "grounding"], ["current", "return path", "circuit", "carries", "normal"], ["safety", "safe", "protect", "protection", "shock", "leak", "leakage", "fault"], ["ground", "soil", "pit", "electrode", "rod", "plate"]],
  gu: "ન્યુટ્રલ એ કામકાજનો વાયર છે — સામાન્ય સ્થિતિમાં તેમાંથી કરંટ પાછો ફરે છે અને સર્કિટ પૂરી થાય છે. અર્થિંગ સલામતી માટે છે — સામાન્ય સ્થિતિમાં તેમાં કરંટ વહેતો નથી. કોઈ ખરાબી થાય અને મશીનની બોડીમાં કરંટ આવી જાય તો અર્થિંગ એ કરંટને સીધો જમીનમાં લઈ જાય છે, જેથી માણસને શોક લાગતો નથી. અર્થિંગ માટે જમીનમાં પ્લેટ કે રોડ નાખેલો હોય છે.",
  en: "Neutral is a working wire. In normal condition the current returns through it and the circuit is completed. Earthing is only for safety, and in normal condition no current flows through it. If there is a fault and current comes into the body of a machine, the earthing takes that current straight into the ground so that a person does not get a shock. For earthing, a plate or a rod is buried in the ground.",
  tip: "«ન્યુટ્રલમાં કરંટ વહે છે, અર્થિંગમાં સામાન્ય રીતે નહીં» — આ ભેદ સ્પષ્ટ બોલો."
},
{
  id: 3,
  cat: "સર્કિટ",
  q: "What is the difference between a series connection and a parallel connection?",
  kw: [["series"], ["parallel"], ["one path", "single path", "same current", "one after", "chain", "line"], ["voltage", "same voltage", "separate", "own", "independent", "divided"], ["one fail", "one fails", "stop", "off", "all", "others", "continue", "house", "wiring"]],
  gu: "સિરીઝ કનેક્શનમાં બધાં ઉપકરણ એક જ લાઇનમાં એક પછી એક જોડાય છે, તેથી બધામાં કરંટ સરખો રહે છે પણ વોલ્ટેજ વહેંચાઈ જાય છે. તેમાં એક ઉપકરણ બગડે તો આખી લાઇન બંધ થઈ જાય. પેરેલલમાં દરેક ઉપકરણ અલગ જોડાય છે, તેથી બધાને પૂરો વોલ્ટેજ મળે છે અને એક બગડે તો બાકીના ચાલુ રહે છે. એટલે ઘરના વાયરિંગમાં પેરેલલ કનેક્શન વપરાય છે.",
  en: "In a series connection all the devices are connected one after another in a single path, so the current is the same in all of them but the voltage gets divided. If one device fails, the whole line stops working. In a parallel connection each device is connected separately, so every device gets the full voltage and if one fails the others keep working. That is why house wiring is always done in parallel.",
  tip: "છેલ્લે «એટલે ઘરના વાયરિંગમાં પેરેલલ વપરાય છે» ઉમેરો — વ્યવહારુ ઉદાહરણથી જવાબ મજબૂત બને છે."
},
{
  id: 4,
  cat: "સમસ્યા નિવારણ",
  q: "A fan in a house is not working. How will you find the fault?",
  kw: [["switch", "supply", "power", "mcb", "fuse", "board"], ["tester", "test", "multimeter", "check", "voltage", "continuity"], ["capacitor", "condenser"], ["winding", "coil", "motor", "burnt", "burn", "short"], ["connection", "wire", "loose", "regulator", "bearing", "tight"]],
  must: [{ kw: ["switch off", "turn off", "power off", "supply off", "isolate", "before"], gu: "તપાસ પહેલાં સપ્લાય બંધ કરવો" }],
  gu: "પહેલાં સપ્લાય બંધ કરીને કામ શરૂ કરું છું. પછી ટેસ્ટરથી બોર્ડ પર વોલ્ટેજ આવે છે કે નહીં તે તપાસું છું — MCB કે ફ્યુઝ ઉડ્યો હોઈ શકે. પછી સ્વિચ અને રેગ્યુલેટર ચકાસું છું. પછી જોડાણ ઢીલાં નથી તે જોઉં છું. ત્યાર બાદ કેપેસિટર તપાસું છું, કારણ કે પંખો ન ચાલવાનું સૌથી સામાન્ય કારણ કેપેસિટર બગડવો છે. છેલ્લે મોટરની વાઇન્ડિંગ કન્ટિન્યુઇટી ચકાસું છું અને બેરિંગ જામ થયું નથી તે જોઉં છું.",
  en: "First I switch off the supply before starting the work. Then I use a tester to check whether voltage is reaching the board, because the MCB or the fuse may have blown. Next I check the switch and the regulator. Then I look for loose connections. After that I check the capacitor, because a faulty capacitor is the most common reason a fan does not run. Finally I check the continuity of the motor winding and see that the bearing is not jammed.",
  tip: "કેપેસિટરનું નામ જરૂર બોલો — પંખાની આ સૌથી સામાન્ય ખરાબી છે, અને ઇન્ટરવ્યુ લેનાર એ સાંભળવા માંગે છે."
},
{
  id: 5,
  cat: "રક્ષણ ઉપકરણ",
  q: "What is an MCB and what is an ELCB? What is the difference?",
  kw: [["mcb", "miniature circuit breaker"], ["elcb", "rccb", "earth leakage"], ["overload", "over load", "short circuit", "short", "excess current", "high current"], ["leak", "leakage", "earth", "shock", "human", "body", "person", "life"], ["trip", "trips", "cut", "off", "protect", "automatic"]],
  gu: "MCB એટલે Miniature Circuit Breaker. તે વાયર અને ઉપકરણોને બચાવે છે — કરંટ વધુ પડતો થાય કે શોર્ટ સર્કિટ થાય તો તે તરત ટ્રિપ થઈને સપ્લાય કાપી નાખે છે. ELCB કે RCCB માણસને બચાવે છે — તે લીકેજ કરંટ પકડે છે. જ્યારે કરંટ જવાના અને પાછા આવવાના પ્રમાણમાં ફરક પડે, એટલે કે કરંટ કોઈના શરીર કે અર્થ મારફતે લીક થાય, ત્યારે તે મિલિસેકન્ડમાં ટ્રિપ થાય છે. ટૂંકમાં MCB સાધનની રક્ષા કરે, ELCB જીવની રક્ષા કરે.",
  en: "MCB means Miniature Circuit Breaker. It protects the wires and the equipment, so if the current becomes too high or there is a short circuit it trips immediately and cuts the supply. An ELCB or RCCB protects the person, because it detects leakage current. When there is a difference between the current going out and the current coming back, meaning current is leaking through a body or through earth, it trips within milliseconds. In short, an MCB protects the equipment and an ELCB protects life.",
  tip: "છેલ્લે એક લીટીમાં સરવાળો કરો: «MCB સાધન બચાવે, ELCB જીવ બચાવે.» આ વાક્ય ઇન્ટરવ્યુમાં ખૂબ સારું લાગે છે."
},
{
  id: 6,
  cat: "માપણી",
  q: "How do you measure voltage and current with a multimeter?",
  kw: [["voltage", "volt"], ["current", "ampere", "amp"], ["parallel", "across", "two point", "both point"], ["series", "clamp", "clamp meter", "break", "line"], ["select", "setting", "mode", "range", "dial", "knob", "ac", "dc", "probe"]],
  gu: "વોલ્ટેજ માપવા માટે મલ્ટિમીટરને વોલ્ટ મોડ પર — AC કે DC પ્રમાણે — સેટ કરું છું અને બે પ્રોબને જે બે પોઇન્ટ વચ્ચે માપવું છે તેની આરપાર, એટલે કે પેરેલલમાં અડાડું છું. કરંટ માપવા માટે મીટરને એમ્પિયર મોડ પર રાખીને સર્કિટમાં સિરીઝમાં જોડવું પડે, એટલે લાઇન તોડવી પડે. તેથી કામમાં હું સામાન્ય રીતે ક્લેમ્પ મીટર વાપરું છું, જેમાં લાઇન તોડ્યા વગર વાયર આસપાસ ક્લેમ્પ ભરાવીને કરંટ મપાય છે.",
  en: "To measure voltage I set the multimeter to the volt mode, AC or DC as required, and touch the two probes across the two points, that is in parallel. To measure current the meter has to be connected in series in the circuit, which means breaking the line. So in practical work I normally use a clamp meter, where I can just clamp it around the wire and read the current without breaking the line.",
  tip: "«વોલ્ટેજ પેરેલલમાં, કરંટ સિરીઝમાં» — આ યાદ રાખવાની ચાવી છે. ક્લેમ્પ મીટરનો ઉલ્લેખ પ્રેક્ટિકલ સમજ દેખાડે છે."
},
{
  id: 7,
  cat: "સલામતી",
  q: "What will you do if you see a person getting an electric shock?",
  kw: [["switch off", "turn off", "power off", "supply off", "main", "plug", "unplug", "mcb"], ["not touch", "do not touch", "never touch", "dont touch", "bare hand", "directly"], ["wood", "stick", "dry", "rubber", "insulated", "cloth", "plastic"], ["ambulance", "hospital", "doctor", "help", "call", "108", "medical"], ["breathing", "breath", "pulse", "cpr", "first aid", "conscious"]],
  must: [
    { kw: ["switch off", "turn off", "power off", "supply off", "main", "unplug", "mcb", "cut the supply"], gu: "પહેલાં સપ્લાય બંધ કરવો" },
    { kw: ["not touch", "do not touch", "never touch", "dont touch", "without touching", "not with bare"], gu: "ખુલ્લા હાથે વ્યક્તિને અડવું નહીં" }
  ],
  gu: "સૌથી પહેલાં દોડીને મુખ્ય સ્વિચ કે MCB બંધ કરું છું અથવા પ્લગ કાઢી નાખું છું. હું વ્યક્તિને ખુલ્લા હાથે અડતો નથી, કારણ કે તો કરંટ મારા શરીરમાં પણ આવે. જો સપ્લાય તરત બંધ ન થઈ શકે તો સૂકા લાકડા, રબર કે પ્લાસ્ટિકની વસ્તુ વડે વ્યક્તિને વાયરથી અલગ કરું છું. પછી તરત ૧૦૮ પર ફોન કરીને એમ્બ્યુલન્સ બોલાવું છું અને સુપરવાઇઝરને જાણ કરું છું. વ્યક્તિનો શ્વાસ ચાલે છે કે નહીં તે તપાસું છું, અને જરૂર પડે તો તાલીમ પ્રમાણે ફર્સ્ટ એઇડ કે CPR આપું છું.",
  en: "The first thing I do is run and switch off the main switch or the MCB, or pull out the plug. I do not touch the person with my bare hands, because then the current will pass into my body also. If the supply cannot be switched off immediately, I use a dry wooden stick, rubber or plastic object to separate the person from the wire. Then I immediately call an ambulance on 108 and inform my supervisor. I check whether the person is breathing, and if needed I give first aid or CPR as per my training.",
  tip: "આ પ્રશ્ન સલામતીની સૌથી મોટી કસોટી છે. ક્રમ આ જ રાખો: સપ્લાય બંધ → ખુલ્લા હાથે ન અડવું → સૂકા લાકડાથી અલગ કરવું → ૧૦૮."
},
{
  id: 8,
  cat: "વાયરિંગ",
  q: "How do you decide the size of the wire for a connection?",
  kw: [["load", "watt", "power", "appliance", "current", "ampere", "amp"], ["calculate", "calculation", "formula", "divide", "voltage"], ["size", "square", "sq mm", "mm", "gauge", "thickness", "thick"], ["length", "distance", "long", "drop", "voltage drop"], ["heat", "hot", "burn", "melt", "overload", "safe", "capacity", "chart", "table"]],
  gu: "પહેલાં એ કનેક્શન પર કેટલો લોડ આવશે તે વોટમાં જોઉં છું. પછી લોડને વોલ્ટેજથી ભાગીને કરંટ એમ્પિયરમાં કાઢું છું. પછી એ કરંટ પ્રમાણે સ્ટાન્ડર્ડ ચાર્ટમાંથી વાયરની સાઇઝ ચોરસ મિલીમીટરમાં પસંદ કરું છું, અને હંમેશા થોડી વધારાની ક્ષમતાવાળી સાઇઝ લઉં છું. અંતર લાંબું હોય તો વોલ્ટેજ ડ્રોપ ટાળવા વાયર એક સાઇઝ જાડો લઉં છું. પાતળો વાયર લગાવીએ તો ગરમ થઈને ઓગળે અને આગ લાગવાનું જોખમ રહે.",
  en: "First I check how much load in watts will come on that connection. Then I divide the load by the voltage to find the current in amperes. According to that current I select the wire size in square millimetres from the standard chart, and I always take a size with a little extra capacity. If the distance is long, I take one size thicker wire to avoid voltage drop. If we use a thin wire it will get hot, melt and cause a fire risk.",
  tip: "લોડ → કરંટ → સાઇઝ એ ક્રમમાં બોલો, અને છેલ્લે પાતળા વાયરનું જોખમ પણ કહો."
},
{
  id: 9,
  cat: "મોટર",
  q: "What is the difference between a single phase and a three phase supply?",
  kw: [["single phase", "one phase", "1 phase"], ["three phase", "3 phase", "thre phase"], ["230", "220", "240", "phase and neutral", "two wire"], ["415", "440", "400", "four wire", "three wire"], ["house", "home", "small", "fan", "light", "industry", "industrial", "motor", "heavy", "machine", "power"]],
  gu: "સિંગલ ફેઝ સપ્લાયમાં એક ફેઝ અને એક ન્યુટ્રલ હોય છે અને વોલ્ટેજ આશરે ૨૩૦ વોલ્ટ મળે છે. તે ઘરના પંખા, લાઇટ અને નાનાં ઉપકરણો માટે વપરાય છે. થ્રી ફેઝમાં ત્રણ ફેઝ અને એક ન્યુટ્રલ હોય છે અને લાઇન વોલ્ટેજ આશરે ૪૧૫ વોલ્ટ મળે છે. તે ઉદ્યોગમાં મોટી મોટર અને ભારે મશીન માટે વપરાય છે, કારણ કે થ્રી ફેઝમાં પાવર સરખો અને સતત મળે છે તથા મોટર જાતે ચાલુ થાય છે.",
  en: "In a single phase supply there is one phase and one neutral, and we get about two hundred thirty volts. It is used for house fans, lights and small appliances. In a three phase supply there are three phases and one neutral, and the line voltage is about four hundred fifteen volts. It is used in industry for big motors and heavy machines, because three phase gives smooth and continuous power and the motor is self starting.",
  tip: "બંનેના વોલ્ટેજના આંકડા બોલો — ૨૩૦ અને ૪૧૫. આંકડા સાથેનો જવાબ વધુ ભરોસાપાત્ર લાગે છે."
},
{
  id: 10,
  cat: "કામની રીત",
  q: "Have you done any practical wiring work during your course? Explain what you did.",
  kw: [["board", "panel", "switch board", "house", "wiring", "circuit"], ["switch", "socket", "holder", "light", "fan", "point", "mcb"], ["connect", "connection", "wire", "join", "fit", "install"], ["test", "tested", "check", "checked", "tester", "working"], ["earth", "earthing", "safety", "supply", "phase", "neutral"]],
  gu: "તમે કોર્સમાં ખરેખર જે કર્યું હોય તે ક્રમમાં કહો. જેમ કે: «કોર્સ દરમિયાન મેં સ્વિચ બોર્ડનું વાયરિંગ કર્યું છે. મેં ડ્રોઇંગ પ્રમાણે MCB, સ્વિચ અને સોકેટ ગોઠવ્યાં, ફેઝ સ્વિચ મારફતે અને ન્યુટ્રલ સીધો જોડ્યો, અર્થિંગ સોકેટના ત્રીજા પિનમાં જોડી. પછી સપ્લાય ચાલુ કરતાં પહેલાં ટેસ્ટરથી બધું ચકાસ્યું અને પછી લાઇટ અને પંખો ચાલુ કરીને તપાસ્યું.» ખોટો દાવો ન કરો, પણ જે કર્યું હોય તે વિગતવાર બોલો.",
  en: "During my course I did the wiring of a switch board. I fitted the MCB, the switches and the socket according to the drawing. I connected the phase through the switch and the neutral directly, and I connected the earth wire to the third pin of the socket. Before switching on the supply I checked all the connections with a tester, and then I switched on the light and the fan to confirm that everything was working properly.",
  tip: "અનુભવના પ્રશ્નમાં જૂઠું ન બોલો. જે કર્યું હોય તે પગલાં સાથે કહો — તેનાથી નાનો અનુભવ પણ મોટો લાગે છે."
}
]});
