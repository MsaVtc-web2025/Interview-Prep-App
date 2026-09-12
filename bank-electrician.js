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
  i18n: {
    gu: { q: "Electrical panel પર કામ કરતાં પહેલાં કઈ safety precautions લો છો?" },
    hi: { q: "Electrical panel पर काम करने से पहले कौन सी safety precautions लेते हैं?",
          gu: "सबसे पहले main switch या breaker बंद करके supply काटता हूँ। फिर panel पर «काम चल रहा है» का tag या lock लगाता हूँ, ताकि कोई और चालू न कर दे। उसके बाद tester या multimeter से पक्का करता हूँ कि सच में current नहीं है। फिर insulated gloves, rubber shoes और insulated tools इस्तेमाल करता हूँ, और हाथ सूखे रखता हूँ। काम शुरू करने से पहले supervisor को बताता हूँ।",
          tip: "«Supply बंद करना» और «tester से पक्का करना» — ये दो छूट गए तो interview में तुरंत मना कर दिया जाता है।" },
    en: { tip: "Switching off the supply and confirming with a tester — miss these two and you are rejected on the spot." }
  },
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
  i18n: {
    gu: { q: "Earthing અને neutral વચ્ચે શું ફરક છે?" },
    hi: { q: "Earthing और neutral में क्या फ़र्क़ है?",
          gu: "Neutral काम करने वाला तार है — सामान्य हालत में उसी से current वापस लौटता है और circuit पूरा होता है। Earthing सुरक्षा के लिए है — सामान्य हालत में उसमें current नहीं बहता। कोई ख़राबी होने पर machine की body में current आ जाए तो earthing उस current को सीधे ज़मीन में ले जाती है, जिससे आदमी को shock नहीं लगता। Earthing के लिए ज़मीन में plate या rod गाड़ा जाता है।",
          tip: "«Neutral में current बहता है, earthing में आम तौर पर नहीं» — यह फ़र्क़ साफ़ बोलिए।" },
    en: { tip: "'Current flows in the neutral, but normally not in the earth' — state that difference clearly." }
  },
  kw: [["neutral", "return"], ["earth", "earthing", "ground", "grounding"], ["current", "return path", "circuit", "carries", "normal"], ["safety", "safe", "protect", "protection", "shock", "leak", "leakage", "fault"], ["ground", "soil", "pit", "electrode", "rod", "plate"]],
  gu: "ન્યુટ્રલ એ કામકાજનો વાયર છે — સામાન્ય સ્થિતિમાં તેમાંથી કરંટ પાછો ફરે છે અને સર્કિટ પૂરી થાય છે. અર્થિંગ સલામતી માટે છે — સામાન્ય સ્થિતિમાં તેમાં કરંટ વહેતો નથી. કોઈ ખરાબી થાય અને મશીનની બોડીમાં કરંટ આવી જાય તો અર્થિંગ એ કરંટને સીધો જમીનમાં લઈ જાય છે, જેથી માણસને શોક લાગતો નથી. અર્થિંગ માટે જમીનમાં પ્લેટ કે રોડ નાખેલો હોય છે.",
  en: "Neutral is a working wire. In normal condition the current returns through it and the circuit is completed. Earthing is only for safety, and in normal condition no current flows through it. If there is a fault and current comes into the body of a machine, the earthing takes that current straight into the ground so that a person does not get a shock. For earthing, a plate or a rod is buried in the ground.",
  tip: "«ન્યુટ્રલમાં કરંટ વહે છે, અર્થિંગમાં સામાન્ય રીતે નહીં» — આ ભેદ સ્પષ્ટ બોલો."
},
{
  id: 3,
  cat: "સર્કિટ",
  q: "What is the difference between a series connection and a parallel connection?",
  i18n: {
    gu: { q: "Series connection અને parallel connection વચ્ચે શું ફરક છે?" },
    hi: { q: "Series connection और parallel connection में क्या फ़र्क़ है?",
          gu: "Series connection में सभी उपकरण एक ही line में एक के बाद एक जुड़ते हैं, इसलिए सबमें current बराबर रहता है पर voltage बँट जाता है। उसमें एक उपकरण ख़राब हो जाए तो पूरी line बंद हो जाती है। Parallel में हर उपकरण अलग जुड़ता है, इसलिए सबको पूरा voltage मिलता है और एक ख़राब हो तो बाक़ी चलते रहते हैं। इसीलिए घर की wiring में parallel connection इस्तेमाल होता है।",
          tip: "आख़िर में «इसीलिए घर की wiring में parallel इस्तेमाल होता है» जोड़िए — व्यावहारिक उदाहरण से जवाब मज़बूत बनता है।" },
    en: { tip: "End with 'that is why house wiring uses parallel' — a practical example makes the answer much stronger." }
  },
  kw: [["series"], ["parallel"], ["one path", "single path", "same current", "one after", "chain", "line"], ["voltage", "same voltage", "separate", "own", "independent", "divided"], ["one fail", "one fails", "stop", "off", "all", "others", "continue", "house", "wiring"]],
  gu: "સિરીઝ કનેક્શનમાં બધાં ઉપકરણ એક જ લાઇનમાં એક પછી એક જોડાય છે, તેથી બધામાં કરંટ સરખો રહે છે પણ વોલ્ટેજ વહેંચાઈ જાય છે. તેમાં એક ઉપકરણ બગડે તો આખી લાઇન બંધ થઈ જાય. પેરેલલમાં દરેક ઉપકરણ અલગ જોડાય છે, તેથી બધાને પૂરો વોલ્ટેજ મળે છે અને એક બગડે તો બાકીના ચાલુ રહે છે. એટલે ઘરના વાયરિંગમાં પેરેલલ કનેક્શન વપરાય છે.",
  en: "In a series connection all the devices are connected one after another in a single path, so the current is the same in all of them but the voltage gets divided. If one device fails, the whole line stops working. In a parallel connection each device is connected separately, so every device gets the full voltage and if one fails the others keep working. That is why house wiring is always done in parallel.",
  tip: "છેલ્લે «એટલે ઘરના વાયરિંગમાં પેરેલલ વપરાય છે» ઉમેરો — વ્યવહારુ ઉદાહરણથી જવાબ મજબૂત બને છે."
},
{
  id: 4,
  cat: "સમસ્યા નિવારણ",
  q: "A fan in a house is not working. How will you find the fault?",
  i18n: {
    gu: { q: "ઘરનો પંખો ચાલતો નથી. તમે fault કેવી રીતે શોધશો?" },
    hi: { q: "घर का पंखा नहीं चल रहा। आप fault कैसे ढूँढेंगे?",
          gu: "पहले supply बंद करके काम शुरू करता हूँ। फिर tester से देखता हूँ कि board पर voltage आ रहा है या नहीं — MCB या fuse उड़ा हो सकता है। फिर switch और regulator जाँचता हूँ। फिर देखता हूँ कि connection ढीले तो नहीं हैं। उसके बाद capacitor जाँचता हूँ, क्योंकि पंखा न चलने की सबसे आम वजह capacitor का ख़राब होना है। आख़िर में motor की winding की continuity जाँचता हूँ और bearing जाम तो नहीं है यह देखता हूँ।",
          tip: "Capacitor का नाम ज़रूर बोलिए — पंखे की यह सबसे आम ख़राबी है, और interview लेने वाला यही सुनना चाहता है।" },
    en: { tip: "Be sure to mention the capacitor — it is the commonest fan fault, and it is what the interviewer wants to hear." }
  },
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
  i18n: {
    gu: { q: "MCB શું છે અને ELCB શું છે? બંને વચ્ચે શું ફરક છે?" },
    hi: { q: "MCB क्या है और ELCB क्या है? दोनों में क्या फ़र्क़ है?",
          gu: "MCB का मतलब Miniature Circuit Breaker। वह तार और उपकरणों को बचाता है — current ज़रूरत से ज़्यादा हो जाए या short circuit हो जाए तो वह तुरंत trip होकर supply काट देता है। ELCB या RCCB आदमी को बचाता है — वह leakage current पकड़ता है। जब जाने और वापस आने वाले current में फ़र्क़ आ जाए, यानी current किसी के शरीर या earth से leak हो, तब वह milliseconds में trip हो जाता है। संक्षेप में MCB उपकरण बचाता है, ELCB जान बचाता है।",
          tip: "आख़िर में एक लाइन में निचोड़ दीजिए: «MCB उपकरण बचाता है, ELCB जान बचाता है।» यह वाक्य interview में बहुत अच्छा लगता है।" },
    en: { tip: "Sum it up in one line at the end: 'MCB protects equipment, ELCB protects life.' That sentence lands very well." }
  },
  kw: [["mcb", "miniature circuit breaker"], ["elcb", "rccb", "earth leakage"], ["overload", "over load", "short circuit", "short", "excess current", "high current"], ["leak", "leakage", "earth", "shock", "human", "body", "person", "life"], ["trip", "trips", "cut", "off", "protect", "automatic"]],
  gu: "MCB એટલે Miniature Circuit Breaker. તે વાયર અને ઉપકરણોને બચાવે છે — કરંટ વધુ પડતો થાય કે શોર્ટ સર્કિટ થાય તો તે તરત ટ્રિપ થઈને સપ્લાય કાપી નાખે છે. ELCB કે RCCB માણસને બચાવે છે — તે લીકેજ કરંટ પકડે છે. જ્યારે કરંટ જવાના અને પાછા આવવાના પ્રમાણમાં ફરક પડે, એટલે કે કરંટ કોઈના શરીર કે અર્થ મારફતે લીક થાય, ત્યારે તે મિલિસેકન્ડમાં ટ્રિપ થાય છે. ટૂંકમાં MCB સાધનની રક્ષા કરે, ELCB જીવની રક્ષા કરે.",
  en: "MCB means Miniature Circuit Breaker. It protects the wires and the equipment, so if the current becomes too high or there is a short circuit it trips immediately and cuts the supply. An ELCB or RCCB protects the person, because it detects leakage current. When there is a difference between the current going out and the current coming back, meaning current is leaking through a body or through earth, it trips within milliseconds. In short, an MCB protects the equipment and an ELCB protects life.",
  tip: "છેલ્લે એક લીટીમાં સરવાળો કરો: «MCB સાધન બચાવે, ELCB જીવ બચાવે.» આ વાક્ય ઇન્ટરવ્યુમાં ખૂબ સારું લાગે છે."
},
{
  id: 6,
  cat: "માપણી",
  q: "How do you measure voltage and current with a multimeter?",
  i18n: {
    gu: { q: "Multimeter થી voltage અને current કેવી રીતે માપો છો?" },
    hi: { q: "Multimeter से voltage और current कैसे मापते हैं?",
          gu: "Voltage मापने के लिए multimeter को volt mode पर — AC या DC के अनुसार — set करता हूँ और दोनों probe जिन दो points के बीच मापना है उनके आर-पार, यानी parallel में लगाता हूँ। Current मापने के लिए meter को ampere mode पर रखकर circuit में series में जोड़ना पड़ता है, यानी line तोड़नी पड़ती है। इसलिए काम में मैं आम तौर पर clamp meter इस्तेमाल करता हूँ, जिसमें line तोड़े बिना तार के चारों ओर clamp लगाकर current मापा जाता है।",
          tip: "«Voltage parallel में, current series में» — यह याद रखने की कुंजी है। Clamp meter का ज़िक्र practical समझ दिखाता है।" },
    en: { tip: "'Voltage in parallel, current in series' is the key to remember. Mentioning a clamp meter shows practical understanding." }
  },
  kw: [["voltage", "volt"], ["current", "ampere", "amp"], ["parallel", "across", "two point", "both point"], ["series", "clamp", "clamp meter", "break", "line"], ["select", "setting", "mode", "range", "dial", "knob", "ac", "dc", "probe"]],
  gu: "વોલ્ટેજ માપવા માટે મલ્ટિમીટરને વોલ્ટ મોડ પર — AC કે DC પ્રમાણે — સેટ કરું છું અને બે પ્રોબને જે બે પોઇન્ટ વચ્ચે માપવું છે તેની આરપાર, એટલે કે પેરેલલમાં અડાડું છું. કરંટ માપવા માટે મીટરને એમ્પિયર મોડ પર રાખીને સર્કિટમાં સિરીઝમાં જોડવું પડે, એટલે લાઇન તોડવી પડે. તેથી કામમાં હું સામાન્ય રીતે ક્લેમ્પ મીટર વાપરું છું, જેમાં લાઇન તોડ્યા વગર વાયર આસપાસ ક્લેમ્પ ભરાવીને કરંટ મપાય છે.",
  en: "To measure voltage I set the multimeter to the volt mode, AC or DC as required, and touch the two probes across the two points, that is in parallel. To measure current the meter has to be connected in series in the circuit, which means breaking the line. So in practical work I normally use a clamp meter, where I can just clamp it around the wire and read the current without breaking the line.",
  tip: "«વોલ્ટેજ પેરેલલમાં, કરંટ સિરીઝમાં» — આ યાદ રાખવાની ચાવી છે. ક્લેમ્પ મીટરનો ઉલ્લેખ પ્રેક્ટિકલ સમજ દેખાડે છે."
},
{
  id: 7,
  cat: "સલામતી",
  q: "What will you do if you see a person getting an electric shock?",
  i18n: {
    gu: { q: "કોઈને electric shock લાગતો જુઓ તો તમે શું કરશો?" },
    hi: { q: "किसी को electric shock लगता देखें तो आप क्या करेंगे?",
          gu: "सबसे पहले दौड़कर main switch या MCB बंद करता हूँ या plug निकाल देता हूँ। मैं उस व्यक्ति को खुले हाथ से नहीं छूता, क्योंकि तब current मेरे शरीर में भी आ जाएगा। अगर supply तुरंत बंद न हो सके तो सूखी लकड़ी, rubber या plastic की चीज़ से व्यक्ति को तार से अलग करता हूँ। फिर तुरंत 108 पर फ़ोन करके ambulance बुलाता हूँ और supervisor को बताता हूँ। व्यक्ति की साँस चल रही है या नहीं यह जाँचता हूँ, और ज़रूरत पड़े तो training के अनुसार first aid या CPR देता हूँ।",
          tip: "यह सवाल safety की सबसे बड़ी परीक्षा है। क्रम यही रखिए: supply बंद, खुले हाथ से न छूना, सूखी लकड़ी से अलग करना, फिर 108।" },
    en: { tip: "This question is the biggest safety test. Keep this order: cut the supply, do not touch with bare hands, separate them with dry wood, call 108." }
  },
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
  i18n: {
    gu: { q: "Connection માટે wire ની size કેવી રીતે નક્કી કરો છો?" },
    hi: { q: "Connection के लिए wire की size कैसे तय करते हैं?",
          gu: "पहले देखता हूँ कि उस connection पर कितना load आएगा, watt में। फिर load को voltage से भाग देकर current ampere में निकालता हूँ। फिर उस current के हिसाब से standard chart से तार की size square millimetre में चुनता हूँ, और हमेशा थोड़ी ज़्यादा क्षमता वाली size लेता हूँ। दूरी लंबी हो तो voltage drop से बचने के लिए तार एक size मोटा लेता हूँ। पतला तार लगाएँ तो वह गर्म होकर पिघल सकता है और आग का ख़तरा रहता है।",
          tip: "Load, फिर current, फिर size — इसी क्रम में बोलिए, और आख़िर में पतले तार का ख़तरा भी बताइए।" },
    en: { tip: "Say it in this order: load, then current, then size — and finish with the danger of an undersized wire." }
  },
  kw: [["load", "watt", "power", "appliance", "current", "ampere", "amp"], ["calculate", "calculation", "formula", "divide", "voltage"], ["size", "square", "sq mm", "mm", "gauge", "thickness", "thick"], ["length", "distance", "long", "drop", "voltage drop"], ["heat", "hot", "burn", "melt", "overload", "safe", "capacity", "chart", "table"]],
  gu: "પહેલાં એ કનેક્શન પર કેટલો લોડ આવશે તે વોટમાં જોઉં છું. પછી લોડને વોલ્ટેજથી ભાગીને કરંટ એમ્પિયરમાં કાઢું છું. પછી એ કરંટ પ્રમાણે સ્ટાન્ડર્ડ ચાર્ટમાંથી વાયરની સાઇઝ ચોરસ મિલીમીટરમાં પસંદ કરું છું, અને હંમેશા થોડી વધારાની ક્ષમતાવાળી સાઇઝ લઉં છું. અંતર લાંબું હોય તો વોલ્ટેજ ડ્રોપ ટાળવા વાયર એક સાઇઝ જાડો લઉં છું. પાતળો વાયર લગાવીએ તો ગરમ થઈને ઓગળે અને આગ લાગવાનું જોખમ રહે.",
  en: "First I check how much load in watts will come on that connection. Then I divide the load by the voltage to find the current in amperes. According to that current I select the wire size in square millimetres from the standard chart, and I always take a size with a little extra capacity. If the distance is long, I take one size thicker wire to avoid voltage drop. If we use a thin wire it will get hot, melt and cause a fire risk.",
  tip: "લોડ → કરંટ → સાઇઝ એ ક્રમમાં બોલો, અને છેલ્લે પાતળા વાયરનું જોખમ પણ કહો."
},
{
  id: 9,
  cat: "મોટર",
  q: "What is the difference between a single phase and a three phase supply?",
  i18n: {
    gu: { q: "Single phase અને three phase supply વચ્ચે શું ફરક છે?" },
    hi: { q: "Single phase और three phase supply में क्या फ़र्क़ है?",
          gu: "Single phase supply में एक phase और एक neutral होता है और voltage लगभग 230 volt मिलता है। वह घर के पंखे, light और छोटे उपकरणों के लिए इस्तेमाल होता है। Three phase में तीन phase और एक neutral होता है और line voltage लगभग 415 volt मिलता है। वह industry में बड़ी motor और भारी machine के लिए इस्तेमाल होता है, क्योंकि three phase में power बराबर और लगातार मिलता है तथा motor अपने आप चालू हो जाती है।",
          tip: "दोनों के voltage के आँकड़े बोलिए — 230 और 415। आँकड़ों के साथ जवाब ज़्यादा भरोसेमंद लगता है।" },
    en: { tip: "Quote both voltages — 230 and 415. An answer with figures sounds far more reliable." }
  },
  kw: [["single phase", "one phase", "1 phase"], ["three phase", "3 phase", "thre phase"], ["230", "220", "240", "phase and neutral", "two wire"], ["415", "440", "400", "four wire", "three wire"], ["house", "home", "small", "fan", "light", "industry", "industrial", "motor", "heavy", "machine", "power"]],
  gu: "સિંગલ ફેઝ સપ્લાયમાં એક ફેઝ અને એક ન્યુટ્રલ હોય છે અને વોલ્ટેજ આશરે ૨૩૦ વોલ્ટ મળે છે. તે ઘરના પંખા, લાઇટ અને નાનાં ઉપકરણો માટે વપરાય છે. થ્રી ફેઝમાં ત્રણ ફેઝ અને એક ન્યુટ્રલ હોય છે અને લાઇન વોલ્ટેજ આશરે ૪૧૫ વોલ્ટ મળે છે. તે ઉદ્યોગમાં મોટી મોટર અને ભારે મશીન માટે વપરાય છે, કારણ કે થ્રી ફેઝમાં પાવર સરખો અને સતત મળે છે તથા મોટર જાતે ચાલુ થાય છે.",
  en: "In a single phase supply there is one phase and one neutral, and we get about two hundred thirty volts. It is used for house fans, lights and small appliances. In a three phase supply there are three phases and one neutral, and the line voltage is about four hundred fifteen volts. It is used in industry for big motors and heavy machines, because three phase gives smooth and continuous power and the motor is self starting.",
  tip: "બંનેના વોલ્ટેજના આંકડા બોલો — ૨૩૦ અને ૪૧૫. આંકડા સાથેનો જવાબ વધુ ભરોસાપાત્ર લાગે છે."
},
{
  id: 10,
  cat: "કામની રીત",
  q: "Have you done any practical wiring work during your course? Explain what you did.",
  i18n: {
    gu: { q: "તમારા course દરમિયાન કોઈ practical wiring કામ કર્યું છે? તમે શું કર્યું તે સમજાવો." },
    hi: { q: "अपने course के दौरान कोई practical wiring का काम किया है? आपने क्या किया, बताइए।",
          gu: "Course में आपने सचमुच जो किया हो वही क्रम से बताइए। जैसे: «Course के दौरान मैंने switch board की wiring की है। मैंने drawing के अनुसार MCB, switch और socket लगाए, phase switch के ज़रिए और neutral सीधा जोड़ा, earthing socket के तीसरे pin में जोड़ी। फिर supply चालू करने से पहले tester से सब जाँचा और उसके बाद light और पंखा चलाकर देखा।» झूठा दावा मत कीजिए, पर जो किया हो उसे विस्तार से बोलिए।",
          tip: "अनुभव के सवाल में झूठ मत बोलिए। जो किया हो उसे क़दम-दर-क़दम बताइए — इससे छोटा अनुभव भी बड़ा लगता है।" },
    en: { tip: "Never lie in an experience question. Describe what you actually did, step by step — that makes even small experience sound substantial." }
  },
  kw: [["board", "panel", "switch board", "house", "wiring", "circuit"], ["switch", "socket", "holder", "light", "fan", "point", "mcb"], ["connect", "connection", "wire", "join", "fit", "install"], ["test", "tested", "check", "checked", "tester", "working"], ["earth", "earthing", "safety", "supply", "phase", "neutral"]],
  gu: "તમે કોર્સમાં ખરેખર જે કર્યું હોય તે ક્રમમાં કહો. જેમ કે: «કોર્સ દરમિયાન મેં સ્વિચ બોર્ડનું વાયરિંગ કર્યું છે. મેં ડ્રોઇંગ પ્રમાણે MCB, સ્વિચ અને સોકેટ ગોઠવ્યાં, ફેઝ સ્વિચ મારફતે અને ન્યુટ્રલ સીધો જોડ્યો, અર્થિંગ સોકેટના ત્રીજા પિનમાં જોડી. પછી સપ્લાય ચાલુ કરતાં પહેલાં ટેસ્ટરથી બધું ચકાસ્યું અને પછી લાઇટ અને પંખો ચાલુ કરીને તપાસ્યું.» ખોટો દાવો ન કરો, પણ જે કર્યું હોય તે વિગતવાર બોલો.",
  en: "During my course I did the wiring of a switch board. I fitted the MCB, the switches and the socket according to the drawing. I connected the phase through the switch and the neutral directly, and I connected the earth wire to the third pin of the socket. Before switching on the supply I checked all the connections with a tester, and then I switched on the light and the fan to confirm that everything was working properly.",
  tip: "અનુભવના પ્રશ્નમાં જૂઠું ન બોલો. જે કર્યું હોય તે પગલાં સાથે કહો — તેનાથી નાનો અનુભવ પણ મોટો લાગે છે."
}
]});
