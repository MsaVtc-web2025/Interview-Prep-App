/* CNC મશીનિંગ કોર્સ — તકનીકી પ્રશ્ન બેંક
   must = ફરજિયાત સલામતીના મુદ્દા. ચૂકી જાય તો ચેતવણી અને કુલ ગુણ મર્યાદિત. */
registerCourse({
  id: "cnc",
  name: "CNC મશીનિંગ",
  icon: "⚙️",
  tagline: "મશીન સેટિંગ, પ્રોગ્રામ અને સલામતી",
  mode: "technical",
  questions: [
{
  id: 1,
  cat: "સલામતી",
  q: "What safety checks do you do before starting a CNC machine?",
  kw: [["door", "guard", "cover", "shield", "closed"], ["coolant", "oil", "lubricant", "level"], ["tool", "holder", "tight", "clamp", "fix"], ["job", "workpiece", "work piece", "fixture", "vice", "chuck"], ["zero", "reference", "home", "offset", "program", "check"]],
  must: [
    { kw: ["emergency stop", "e-stop", "estop", "emergency"], gu: "ઇમરજન્સી સ્ટોપ બટન તપાસવું" },
    { kw: ["goggles", "glasses", "shoes", "ppe", "safety shoe", "helmet", "apron"], gu: "સલામતી સાધનો (PPE) પહેરવાં" }
  ],
  gu: "મશીન ચાલુ કરતાં પહેલાં પહેલાં સલામતી ચશ્માં અને સેફ્ટી શૂઝ પહેરું છું. પછી ઇમરજન્સી સ્ટોપ બટન કામ કરે છે કે નહીં તે તપાસું છું. ત્યાર બાદ મશીનનાં ગાર્ડ અને દરવાજા બંધ છે તે જોઉં છું, કૂલન્ટનું લેવલ ચકાસું છું, ટૂલ હોલ્ડરમાં ટૂલ મજબૂત બેઠું છે તે જોઉં છું, અને જોબ ફિક્સ્ચર કે વાઇસમાં બરાબર પકડાયો છે તે ચકાસું છું. છેલ્લે પ્રોગ્રામ અને ઝીરો ઓફસેટ એક વાર તપાસી લઉં છું.",
  en: "Before starting the machine I first wear my safety goggles and safety shoes. Then I check that the emergency stop button is working. After that I make sure all the machine guards and doors are closed, I check the coolant level, I check that the tool is tightly fixed in the tool holder, and I check that the job is properly clamped in the fixture or vice. Finally I verify the program and the zero offset once before running.",
  tip: "સલામતીના પ્રશ્નમાં «ઇમરજન્સી સ્ટોપ» અને «PPE» બોલવું ફરજિયાત છે. આ બે ચૂકી જવાય તો ઇન્ટરવ્યુમાં તરત નકારાય છે."
},
{
  id: 2,
  cat: "મૂળભૂત",
  q: "What does CNC stand for, and how is it different from a manual machine?",
  kw: [["computer numerical control", "computerised numerical control", "computer numeric"], ["program", "programme", "code", "software"], ["automatic", "automatically", "auto"], ["manual", "hand", "operator", "handwheel"], ["accurate", "accuracy", "precise", "same", "repeat", "faster", "fast"]],
  gu: "CNC નું પૂરું નામ Computer Numerical Control છે. મેન્યુઅલ મશીનમાં ઓપરેટર હાથે હેન્ડવ્હીલ ફેરવીને ટૂલ ચલાવે છે, જ્યારે CNC માં પ્રોગ્રામ કોડ પ્રમાણે મશીન આપોઆપ ટૂલ ચલાવે છે. તેથી CNC માં ચોકસાઈ વધુ મળે છે, એક જ માપના સેંકડો પાર્ટ સરખા બને છે, અને કામ ઝડપથી થાય છે.",
  en: "CNC stands for Computer Numerical Control. In a manual machine the operator moves the tool by hand using the handwheel, but in a CNC machine the tool moves automatically according to the program code. Because of that CNC gives much better accuracy, hundreds of parts come out exactly the same size, and the work is faster.",
  tip: "પૂરું નામ સ્પષ્ટ બોલો — «Computer Numerical Control». ફક્ત «CNC» એમ કહીને અટકશો નહીં."
},
{
  id: 3,
  cat: "પ્રોગ્રામિંગ",
  q: "What is the difference between a G-code and an M-code?",
  kw: [["g code", "g-code", "gcode"], ["m code", "m-code", "mcode"], ["movement", "motion", "move", "geometry", "path", "position"], ["machine", "function", "spindle", "coolant", "tool change", "stop"], ["example", "g01", "g0", "g1", "m03", "m3", "m30", "m05"]],
  gu: "G-code મશીનની હલનચલન નક્કી કરે છે — ટૂલ ક્યાં અને કઈ રીતે જવું જોઈએ. જેમ કે G01 એટલે સીધી લીટીમાં કાપતાં કાપતાં જવું. M-code મશીનનાં બીજાં કામ ચાલુ-બંધ કરે છે — જેમ કે M03 એટલે સ્પિન્ડલ ઘડિયાળની દિશામાં ચાલુ કરવું, M05 એટલે સ્પિન્ડલ બંધ કરવું અને M30 એટલે પ્રોગ્રામ પૂરો કરવો.",
  en: "G-codes control the movement of the machine, that is where and how the tool should travel. For example G01 means move in a straight line while cutting. M-codes control the other machine functions, for example M03 starts the spindle clockwise, M05 stops the spindle, and M30 ends the program.",
  tip: "દરેક પ્રકારનું એક ઉદાહરણ આપો. ઉદાહરણ વગરનો જવાબ અધૂરો ગણાય છે."
},
{
  id: 4,
  cat: "મશીન સેટિંગ",
  q: "How do you set the work zero or job zero on a CNC machine?",
  kw: [["zero", "datum", "reference", "origin"], ["probe", "edge finder", "dial", "touch", "paper", "feeler"], ["x", "y", "z", "axis"], ["offset", "g54", "g55", "work offset", "wcs"], ["enter", "set", "record", "save", "memory"]],
  gu: "પહેલાં જોબને ફિક્સ્ચરમાં મજબૂત પકડું છું. પછી એજ ફાઇન્ડર કે પ્રોબ વડે ટૂલને જોબની X અને Y બાજુ પર અડાડીને એ જગ્યાનું માપ લઉં છું. ત્યાર બાદ Z અક્ષ માટે ટૂલને જોબની ઉપરની સપાટી પર અડાડું છું. પછી એ ત્રણેય માપ મશીનના વર્ક ઓફસેટમાં — જેમ કે G54 માં — નાખીને સેવ કરું છું. છેલ્લે ડ્રાય રન કરીને ઝીરો સાચો છે તે ચકાસું છું.",
  en: "First I clamp the job tightly in the fixture. Then using an edge finder or a probe I touch the tool to the X and Y sides of the job and note that position. After that I touch the tool on the top surface of the job for the Z axis. Then I enter all three values in the machine work offset, for example G54, and save it. Finally I do a dry run to confirm the zero is correct.",
  tip: "છેલ્લે «ડ્રાય રન કરીને ચકાસું છું» ઉમેરો. તેનાથી લાગે છે કે તમે સાવધાનીથી કામ કરો છો."
},
{
  id: 5,
  cat: "કટિંગ પેરામીટર",
  q: "What is feed rate and what is cutting speed?",
  kw: [["feed", "feed rate"], ["speed", "cutting speed", "surface speed", "rpm", "spindle"], ["tool", "material", "job", "workpiece"], ["fast", "slow", "minute", "revolution", "mm"], ["finish", "break", "damage", "life", "heat", "quality"]],
  gu: "કટિંગ સ્પીડ એટલે ટૂલ કે જોબ કેટલી ઝડપે ફરે છે — તે સ્પિન્ડલના RPM સાથે સંબંધ ધરાવે છે. ફીડ રેટ એટલે ટૂલ જોબમાં કેટલી ઝડપે આગળ વધે છે, જે મિલીમીટર પ્રતિ મિનિટ કે પ્રતિ રિવોલ્યુશનમાં મપાય છે. બંને જોબની ધાતુ અને ટૂલ પ્રમાણે નક્કી થાય છે. ફીડ કે સ્પીડ વધુ રાખીએ તો ટૂલ તૂટે અથવા સપાટી ખરાબ આવે, અને ઓછી રાખીએ તો સમય બગડે.",
  en: "Cutting speed is how fast the tool or the job rotates, and it is related to the spindle RPM. Feed rate is how fast the tool moves into the job, and it is measured in millimetres per minute or per revolution. Both are decided according to the job material and the tool. If the feed or speed is too high the tool can break or the surface finish becomes poor, and if it is too low we waste time.",
  tip: "બંનેને સરખાવ્યા પછી «વધુ રાખીએ તો શું થાય» એ પણ કહો — તેનાથી સમજ દેખાય છે."
},
{
  id: 6,
  cat: "માપણી",
  q: "Which measuring instruments do you use, and how do you check a job after machining?",
  kw: [["vernier", "caliper", "calliper"], ["micrometer", "micrometre", "mike"], ["dial", "gauge", "indicator", "bore", "height"], ["drawing", "print", "tolerance", "dimension", "specification", "limit"], ["check", "measure", "compare", "clean", "verify"]],
  gu: "હું મુખ્યત્વે વર્નિયર કેલિપર, માઇક્રોમીટર અને ડાયલ ગેજ વાપરું છું. જોબ મશીન થઈ ગયા પછી પહેલાં તેને સાફ કરું છું, પછી ડ્રોઇંગમાં આપેલા દરેક માપ સાથે સરખાવીને માપ લઉં છું. માપ ટોલરન્સની અંદર છે કે નહીં તે ચકાસું છું. ટોલરન્સ બહાર જાય તો સુપરવાઇઝરને જાણ કરું છું અને ઓફસેટ સુધારીને આગળનો પાર્ટ બનાવું છું.",
  en: "I mainly use a vernier caliper, a micrometer and a dial gauge. After the job is machined I first clean it, then I measure every dimension and compare it with the drawing. I check whether the measurement is within tolerance. If it is out of tolerance I inform my supervisor and correct the offset before machining the next part.",
  tip: "«ટોલરન્સ» શબ્દ વાપરો અને માપ ખોટું આવે તો શું કરશો તે પણ કહો."
},
{
  id: 7,
  cat: "સલામતી",
  q: "What will you do if something goes wrong while the machine is running?",
  kw: [["stop", "immediately", "at once", "first"], ["supervisor", "senior", "in charge", "inform", "report", "tell"], ["door", "guard", "hand", "inside", "touch", "away"], ["check", "reason", "cause", "problem", "find"], ["restart", "again", "after", "clear", "safe"]],
  must: [
    { kw: ["emergency stop", "e-stop", "estop", "emergency", "stop button", "red button"], gu: "તરત ઇમરજન્સી સ્ટોપ દબાવવું" },
    { kw: ["not open", "do not open", "never open", "not put", "do not put", "never put", "not touch", "do not touch", "never touch", "hand inside", "my hand", "completely stop", "fully stop", "has stopped", "away", "wait"], gu: "મશીન પૂરું બંધ થાય ત્યાં સુધી દરવાજો ન ખોલવો કે હાથ અંદર ન નાખવો" }
  ],
  gu: "કંઈ ખોટું થાય તો સૌથી પહેલાં ઇમરજન્સી સ્ટોપ બટન દબાવીને મશીન બંધ કરું છું. મશીન પૂરેપૂરું બંધ થાય ત્યાં સુધી દરવાજો ખોલતો નથી અને હાથ અંદર નાખતો નથી. પછી તરત સુપરવાઇઝરને જાણ કરું છું. મારી જાતે મોટી સમસ્યા સુધારવાની કોશિશ કરતો નથી. કારણ શોધાય અને જગ્યા સલામત થાય પછી જ મશીન ફરી ચાલુ કરું છું.",
  en: "If something goes wrong, the first thing I do is press the emergency stop button to stop the machine. I do not open the door or put my hand inside until the machine has completely stopped. Then I immediately inform my supervisor. I do not try to fix a big problem myself. I restart the machine only after the cause is found and the area is safe.",
  tip: "ક્રમ મહત્ત્વનો છે: પહેલાં મશીન બંધ, પછી સુપરવાઇઝરને જાણ. ઊંધો ક્રમ ખોટો ગણાય."
},
{
  id: 8,
  cat: "ટૂલિંગ",
  q: "How do you know when a cutting tool needs to be changed?",
  kw: [["wear", "worn", "blunt", "dull", "damage", "chip", "break", "crack"], ["sound", "noise", "vibration", "vibrate", "chatter"], ["finish", "surface", "rough", "quality", "mark"], ["size", "dimension", "measurement", "tolerance", "accurate"], ["burr", "colour", "color", "burn", "heat", "spark", "load", "power"]],
  gu: "ટૂલ બદલવાની જરૂર છે તે ઘણી નિશાનીઓથી ખબર પડે છે. પહેલી નિશાની — કાપતી વખતે અવાજ બદલાય કે વાઇબ્રેશન વધે. બીજી — જોબની સપાટી ખરબચડી આવે કે નિશાન પડે. ત્રીજી — માપ ટોલરન્સ બહાર જવા લાગે. ચોથી — ટૂલની ધાર જોઈએ તો ઘસાયેલી, બુઠ્ઠી કે તૂટેલી દેખાય, અથવા વધુ ગરમીથી રંગ બદલાયેલો દેખાય. આવું દેખાય તો મશીન બંધ કરીને ટૂલ બદલું છું.",
  en: "There are several signs that tell me the tool needs changing. First, the cutting sound changes or the vibration increases. Second, the surface finish becomes rough or marks appear on the job. Third, the dimensions start going out of tolerance. Fourth, when I look at the tool edge it is worn, blunt or chipped, or the colour has changed because of heat. When I see these signs I stop the machine and change the tool.",
  tip: "ઓછામાં ઓછી ત્રણ નિશાની ગણાવો. એક જ નિશાની આપવાથી ઓછો અનુભવ લાગે છે."
},
{
  id: 9,
  cat: "કૂલન્ટ અને દેખરેખ",
  q: "Why is coolant used in machining, and what daily maintenance do you do on the machine?",
  kw: [["cool", "cooling", "heat", "temperature", "hot"], ["chip", "chips", "flush", "clear", "remove", "clean"], ["tool life", "life", "wear", "friction", "lubricate", "lubrication"], ["finish", "surface", "quality"], ["level", "check", "daily", "clean", "grease", "oil", "filter"]],
  gu: "કૂલન્ટનું મુખ્ય કામ કાપતી વખતે પેદા થતી ગરમી ઓછી કરવાનું છે. તે ઘર્ષણ ઘટાડે છે, ટૂલની ઉંમર વધારે છે, ચીપ્સ ધોઈને દૂર કરે છે અને જોબની સપાટી સારી લાવે છે. રોજની દેખરેખમાં હું કૂલન્ટનું લેવલ તપાસું છું, મશીન અને ચીપ ટ્રે સાફ કરું છું, લુબ્રિકેશન ઓઇલ ચકાસું છું, અને હવાનું પ્રેશર જોઉં છું.",
  en: "The main job of coolant is to reduce the heat produced during cutting. It reduces friction, increases tool life, flushes the chips away and gives a better surface finish. For daily maintenance I check the coolant level, clean the machine and the chip tray, check the lubrication oil, and check the air pressure.",
  tip: "કૂલન્ટના બે-ત્રણ ફાયદા બોલો, ફક્ત «ઠંડું કરે છે» એટલું ન કહો."
},
{
  id: 10,
  cat: "કામની તૈયારી",
  q: "You are given a new drawing to machine. What are the steps you will follow?",
  kw: [["drawing", "print", "study", "read", "understand", "dimension"], ["material", "raw", "stock", "size", "check"], ["tool", "tooling", "select", "list", "load"], ["program", "programme", "write", "load", "simulate", "dry run"], ["first piece", "first part", "check", "measure", "inspect", "approval", "then", "production"]],
  gu: "પહેલાં ડ્રોઇંગ ધ્યાનથી વાંચીને દરેક માપ, ટોલરન્સ અને સપાટીની જરૂરિયાત સમજું છું. પછી કાચો માલ સાચો છે અને માપ પૂરતું છે તે ચકાસું છું. ત્યાર બાદ કયાં ટૂલ જોઈશે તે નક્કી કરીને મશીનમાં લોડ કરું છું. પછી પ્રોગ્રામ લોડ કરીને સિમ્યુલેશન અને ડ્રાય રન કરું છું. પછી પહેલો પાર્ટ ધીમી ફીડ પર બનાવીને પૂરેપૂરો માપી લઉં છું. પહેલો પાર્ટ મંજૂર થાય પછી જ પૂરું પ્રોડક્શન ચાલુ કરું છું.",
  en: "First I read the drawing carefully and understand every dimension, tolerance and surface requirement. Then I check that the raw material is correct and big enough. After that I decide which tools are needed and load them in the machine. Then I load the program and do a simulation and a dry run. Next I machine the first part at a slow feed and measure it completely. Only after the first part is approved do I start full production.",
  tip: "«પહેલો પાર્ટ તપાસીને મંજૂર કરાવવો» — આ મુદ્દો ઉદ્યોગમાં ખૂબ મહત્ત્વનો છે, તે જરૂર બોલો."
}
]});
