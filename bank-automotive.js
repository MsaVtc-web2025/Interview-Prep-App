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
  kw: [["petrol", "gasoline"], ["diesel"], ["spark", "spark plug", "spark ignition", "plug"], ["compression", "compression ignition", "heat", "pressure", "self"], ["mileage", "efficient", "efficiency", "torque", "power", "cost", "noise", "sound", "injector"]],
  gu: "પેટ્રોલ એન્જિનમાં હવા અને પેટ્રોલનું મિશ્રણ દબાય છે અને પછી સ્પાર્ક પ્લગની ચિનગારીથી સળગે છે, તેથી તેને સ્પાર્ક ઇગ્નિશન એન્જિન કહે છે. ડીઝલ એન્જિનમાં ફક્ત હવા ખૂબ વધારે દબાય છે, જેથી હવા ખૂબ ગરમ થાય, અને પછી ઇન્જેક્ટર દ્વારા ડીઝલ છાંટતાં તે જાતે સળગે છે — તેને કમ્પ્રેશન ઇગ્નિશન કહે છે. ડીઝલ એન્જિનમાં ટોર્ક અને માઇલેજ વધારે મળે, પણ અવાજ અને વાઇબ્રેશન વધુ હોય છે.",
  en: "In a petrol engine the mixture of air and petrol is compressed and then burned by a spark from the spark plug, so it is called a spark ignition engine. In a diesel engine only air is compressed very highly so the air becomes very hot, and then diesel is sprayed by the injector and it burns by itself, which is called compression ignition. A diesel engine gives more torque and better mileage, but it has more noise and vibration.",
  tip: "«સ્પાર્ક ઇગ્નિશન» અને «કમ્પ્રેશન ઇગ્નિશન» એ બે તકનીકી શબ્દો બોલો. તેનાથી જવાબ વ્યાવસાયિક લાગે છે."
},
{
  id: 2,
  cat: "એન્જિન",
  q: "Explain the four strokes of a four stroke engine.",
  kw: [["suction", "intake", "inlet", "induction"], ["compression", "compress"], ["power", "combustion", "expansion", "explosion", "ignition"], ["exhaust", "outlet"], ["piston", "valve", "crank", "down", "up", "cycle"]],
  gu: "ચાર સ્ટ્રોક આ ક્રમમાં થાય છે. પહેલો, સક્શન સ્ટ્રોક — ઇનલેટ વાલ્વ ખૂલે અને પિસ્ટન નીચે જતાં હવા અને ઇંધણ અંદર ખેંચાય. બીજો, કમ્પ્રેશન સ્ટ્રોક — બંને વાલ્વ બંધ થાય અને પિસ્ટન ઉપર જઈને મિશ્રણ દબાવે. ત્રીજો, પાવર સ્ટ્રોક — મિશ્રણ સળગે અને પિસ્ટન જોરથી નીચે ધકેલાય, જેમાંથી પાવર મળે. ચોથો, એક્ઝોસ્ટ સ્ટ્રોક — એક્ઝોસ્ટ વાલ્વ ખૂલે અને પિસ્ટન ઉપર જઈને બળેલો ધુમાડો બહાર કાઢે.",
  en: "The four strokes happen in this order. First, the suction stroke, where the inlet valve opens and the piston moves down to draw in air and fuel. Second, the compression stroke, where both valves close and the piston moves up to compress the mixture. Third, the power stroke, where the mixture burns and pushes the piston down forcefully, and this gives the power. Fourth, the exhaust stroke, where the exhaust valve opens and the piston moves up to push out the burnt gases.",
  tip: "ચારેય નામ ક્રમમાં બોલો અને દરેક સાથે પિસ્ટન ઉપર જાય કે નીચે તે કહો. આ પ્રશ્ન લગભગ દરેક ઇન્ટરવ્યુમાં પુછાય છે."
},
{
  id: 3,
  cat: "બ્રેક સિસ્ટમ",
  q: "How does a hydraulic brake system work?",
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
  kw: [["engine oil", "oil", "lubricant"], ["filter", "air filter", "oil filter", "fuel filter"], ["brake", "brake pad", "brake shoe", "brake fluid"], ["tyre", "tire", "pressure", "air", "wheel"], ["battery", "coolant", "water", "light", "clutch", "belt", "plug"]],
  gu: "નિયમિત સર્વિસમાં પહેલાં એન્જિન ઓઇલનું લેવલ અને હાલત તપાસીને જરૂર પડે તો બદલું છું. પછી ઓઇલ ફિલ્ટર, એર ફિલ્ટર અને ફ્યુઅલ ફિલ્ટર ચકાસું છું. ત્યાર બાદ બ્રેક પેડ કે શૂનું ઘસારો અને બ્રેક ફ્લુઇડનું લેવલ જોઉં છું. પછી ટાયરનું પ્રેશર અને ઘસારો તપાસું છું. પછી બેટરીના ટર્મિનલ, કૂલન્ટનું લેવલ, બેલ્ટની ટાઇટનેસ, સ્પાર્ક પ્લગ અને બધી લાઇટ ચકાસું છું. છેલ્લે ટેસ્ટ ડ્રાઇવ લઈને કોઈ અવાજ કે સમસ્યા નથી તે જોઉં છું.",
  en: "In a regular service I first check the engine oil level and condition and change it if needed. Then I check the oil filter, air filter and fuel filter. After that I check the brake pad or shoe wear and the brake fluid level. Next I check the tyre pressure and tyre wear. Then I check the battery terminals, the coolant level, the belt tension, the spark plugs and all the lights. Finally I take a test drive to make sure there is no noise or problem.",
  tip: "છેલ્લે «ટેસ્ટ ડ્રાઇવ લઉં છું» ઉમેરો — સર્વિસ સ્ટેશનમાં આ મુદ્દો ખૂબ ગમે છે."
},
{
  id: 5,
  cat: "ડાયગ્નોસિસ",
  q: "A customer says the car is not starting. How will you find the problem?",
  kw: [["battery", "terminal", "charge", "voltage", "weak", "dead"], ["fuel", "petrol", "diesel", "tank", "pump", "empty"], ["starter", "self", "motor", "solenoid", "crank", "cranking"], ["spark", "plug", "ignition", "coil"], ["ask", "customer", "sound", "noise", "listen", "check", "wire", "fuse", "connection"]],
  gu: "પહેલાં ગ્રાહકને પૂછું છું કે ક્યારથી થાય છે અને ચાવી ફેરવતાં કોઈ અવાજ આવે છે કે નહીં — તેનાથી અડધું કારણ ખબર પડી જાય. પછી બેટરી તપાસું છું, કારણ કે એ સૌથી સામાન્ય કારણ છે — ટર્મિનલ ઢીલા કે કાટવાળા છે કે વોલ્ટેજ ઓછો છે તે જોઉં છું. પછી ટાંકીમાં ઇંધણ છે કે નહીં અને ફ્યુઅલ પંપ ચાલે છે કે નહીં તે ચકાસું છું. ત્યાર બાદ સેલ્ફ મોટર અને તેના જોડાણ તપાસું છું. પછી સ્પાર્ક પ્લગ અને ઇગ્નિશન કોઇલ જોઉં છું. છેલ્લે ફ્યુઝ અને વાયરિંગ ચકાસું છું.",
  en: "First I ask the customer since when it is happening and whether there is any sound when the key is turned, because that already tells me half the reason. Then I check the battery, since that is the most common cause, and I look for loose or corroded terminals and low voltage. Next I check whether there is fuel in the tank and whether the fuel pump is working. After that I check the starter motor and its connections. Then I check the spark plugs and the ignition coil. Finally I check the fuses and the wiring.",
  tip: "«પહેલાં ગ્રાહકને પૂછું છું» — આ પ્રથમ પગલું બોલવાથી તમે વ્યાવસાયિક લાગશો."
},
{
  id: 6,
  cat: "સલામતી",
  q: "What safety precautions do you take while working in a workshop?",
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
  kw: [["engine"], ["gearbox", "transmission", "gear"], ["connect", "disconnect", "engage", "disengage", "separate", "join"], ["gear change", "change gear", "shift", "shifting", "smooth", "smoothly"], ["start", "stop", "moving", "slip", "friction", "plate"]],
  gu: "ક્લચનું કામ એન્જિન અને ગિયરબોક્સ વચ્ચેનું જોડાણ જરૂર પ્રમાણે જોડવાનું અને છોડવાનું છે. જ્યારે ડ્રાઇવર ક્લચ પેડલ દબાવે ત્યારે એન્જિનનો પાવર ગિયરબોક્સથી અલગ થઈ જાય છે, જેથી ગિયર સહેલાઈથી બદલાય. પેડલ છોડતાં ક્લચ પ્લેટ ફ્લાયવ્હીલ સાથે દબાઈને પાવર પાછો ગિયરબોક્સ સુધી પહોંચાડે છે. ક્લચ ગાડીને ધીમેથી ચાલુ કરવામાં અને એન્જિન બંધ પડ્યા વગર ઊભી રાખવામાં પણ મદદ કરે છે.",
  en: "The work of the clutch is to connect and disconnect the engine from the gearbox as required. When the driver presses the clutch pedal, the engine power is separated from the gearbox so that the gear can be changed easily. When the pedal is released, the clutch plate presses against the flywheel and sends the power back to the gearbox. The clutch also helps to start the vehicle smoothly and to stop it without the engine switching off.",
  tip: "«જોડવું અને છોડવું» એ મુખ્ય શબ્દો છે. પછી ગિયર બદલવાનું ઉદાહરણ આપો."
},
{
  id: 8,
  cat: "કૂલિંગ સિસ્ટમ",
  q: "Why does an engine overheat, and what will you check?",
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
  kw: [["pressure", "air", "psi"], ["mileage", "fuel", "efficiency", "consumption", "economy"], ["wear", "worn", "uneven", "life", "tyre life", "tire life"], ["grip", "control", "brake", "braking", "skid", "safety", "safe", "burst", "blast"], ["week", "weekly", "regular", "month", "cold", "check"]],
  gu: "ટાયરનું પ્રેશર બરાબર હોવું જરૂરી છે કારણ કે ઓછું પ્રેશર હોય તો ટાયર વધુ ઘસાય, માઇલેજ ઘટે અને ટાયર ગરમ થઈને ફાટવાનું જોખમ રહે. વધુ પ્રેશર હોય તો ટાયર વચ્ચેથી ઘસાય, રોડ પર પકડ ઓછી થાય અને બ્રેક મારતાં ગાડી સ્કિડ થઈ શકે. બરાબર પ્રેશર હોય તો ટાયર સરખું ઘસાય, માઇલેજ સારું મળે અને ગાડી કાબૂમાં રહે. પ્રેશર દર અઠવાડિયે તપાસવું જોઈએ, અને ટાયર ઠંડાં હોય ત્યારે તપાસવું — ગાડી ચલાવ્યા પછી ટાયર ગરમ હોય તો રીડિંગ વધારે આવે.",
  en: "Correct tyre pressure is important because if the pressure is low the tyre wears out faster, the mileage drops, and the tyre can get hot and burst. If the pressure is too high the tyre wears out from the centre, the grip on the road reduces, and the vehicle can skid while braking. With correct pressure the tyre wears evenly, the mileage is good and the vehicle stays in control. The pressure should be checked every week, and it should be checked when the tyres are cold, because after driving the tyres are hot and the reading comes out higher.",
  tip: "«ઠંડાં ટાયરમાં પ્રેશર તપાસવું» — આ નાનો મુદ્દો ઉમેરવાથી ખરો અનુભવ દેખાય છે."
},
{
  id: 10,
  cat: "ગ્રાહક સેવા",
  q: "A customer is angry because the same problem came back after a repair. How will you handle it?",
  kw: [["listen", "calm", "calmly", "patient", "patiently", "sorry", "apolog"], ["ask", "understand", "detail", "when", "what", "explain"], ["check", "inspect", "test drive", "verify", "again", "diagnose"], ["supervisor", "senior", "manager", "inform", "help"], ["solve", "repair", "free", "properly", "time", "update", "inform", "confidence", "satisfy"]],
  gu: "પહેલાં ગ્રાહકને શાંતિથી પૂરું સાંભળું છું અને વચ્ચે દલીલ કરતો નથી. તકલીફ થઈ તે માટે માફી માંગું છું. પછી વિગતે પૂછું છું કે સમસ્યા ક્યારે અને કઈ સ્થિતિમાં ફરી આવી. ત્યાર બાદ ગાડી જાતે તપાસું છું અને જરૂર પડે તો ગ્રાહકને સાથે રાખીને ટેસ્ટ ડ્રાઇવ લઉં છું, જેથી સાચી સમસ્યા સમજાય. પછી સિનિયર કે સુપરવાઇઝરને જાણ કરું છું. ગ્રાહકને સ્પષ્ટ કહું છું કે શું ખરાબી છે, કેટલો સમય લાગશે, અને કામ પૂરું થાય ત્યાં સુધી અપડેટ આપતો રહું છું. મારી ભૂલ હોય તો સ્વીકારીને સુધારી આપું છું.",
  en: "First I listen to the customer calmly and completely without arguing. I apologise for the inconvenience. Then I ask in detail when and in what condition the problem came back. After that I check the vehicle myself, and if needed I take a test drive with the customer so that I understand the real problem. Then I inform my senior or supervisor. I clearly tell the customer what the fault is and how much time it will take, and I keep giving updates until the work is finished. If it was my mistake I accept it and correct it.",
  tip: "આ પ્રશ્નમાં તકનીકી જ્ઞાન નહીં, વર્તન જોવાય છે. «શાંતિથી સાંભળું છું» થી શરૂ કરો અને દલીલ કરવાની વાત ન કરો."
}
]});
