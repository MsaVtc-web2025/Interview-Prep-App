/* નર્સિંગ કોર્સ — તકનીકી પ્રશ્ન બેંક (GNM / ANM / નર્સિંગ સહાયક સ્તર)
   must = ફરજિયાત દર્દી-સલામતીના મુદ્દા. ચૂકી જાય તો ચેતવણી અને કુલ ગુણ મર્યાદિત. */
registerCourse({
  id: "nursing",
  name: "નર્સિંગ",
  icon: "🩺",
  tagline: "દર્દી સંભાળ, સ્વચ્છતા અને પ્રાથમિક સારવાર",
  mode: "technical",
  questions: [
{
  id: 1,
  cat: "મૂળભૂત",
  q: "What are the vital signs, and what are their normal values in an adult?",
  kw: [["temperature", "temp", "98", "37"], ["pulse", "heart rate", "60", "100", "72"], ["respiration", "respiratory", "breathing", "12", "20", "16"], ["blood pressure", "bp", "120", "80"], ["oxygen", "spo2", "saturation", "95", "spo"]],
  gu: "ચાર મુખ્ય વાઇટલ સાઇન છે, અને આજકાલ ઓક્સિજન સેચ્યુરેશન પણ ગણાય છે. પહેલું, તાપમાન — સામાન્ય રીતે ૯૮.૬ ડિગ્રી ફેરનહાઇટ એટલે ૩૭ ડિગ્રી સેલ્સિયસ. બીજું, પલ્સ — પ્રતિ મિનિટ ૬૦ થી ૧૦૦ ધબકારા. ત્રીજું, શ્વાસનો દર — પ્રતિ મિનિટ ૧૨ થી ૨૦ વાર. ચોથું, બ્લડ પ્રેશર — આશરે ૧૨૦ ઉપર ૮૦. અને પાંચમું, ઓક્સિજન સેચ્યુરેશન — ૯૫ ટકા કે વધુ.",
  en: "There are four main vital signs, and nowadays oxygen saturation is also counted. First, temperature, which is normally ninety eight point six degrees Fahrenheit, that is thirty seven degrees Celsius. Second, pulse, which is sixty to one hundred beats per minute. Third, respiration rate, which is twelve to twenty breaths per minute. Fourth, blood pressure, which is around one twenty over eighty. And fifth, oxygen saturation, which should be ninety five percent or above.",
  tip: "દરેક વાઇટલ સાઇન સાથે તેનો સામાન્ય આંકડો બોલો. ફક્ત નામ ગણાવવાથી અડધા ગુણ મળે છે."
},
{
  id: 2,
  cat: "સંક્રમણ નિયંત્રણ",
  q: "How do you prevent the spread of infection in a hospital ward?",
  kw: [["glove", "gloves", "mask", "gown", "apron", "ppe", "cap"], ["sterile", "sterilise", "sterilize", "disinfect", "clean", "cleaning", "autoclave"], ["waste", "dispose", "disposal", "bin", "colour", "color", "segregate", "sharp", "needle"], ["patient", "isolation", "separate", "bed", "linen", "bedsheet", "change"], ["before", "after", "each", "every", "between", "touch"]],
  must: [{ kw: ["hand wash", "handwash", "wash my hand", "wash hand", "washing hand", "hand hygiene", "sanitiser", "sanitizer", "hand rub", "soap"], gu: "હાથ ધોવા / હેન્ડ હાઇજીન" }],
  gu: "સંક્રમણ રોકવાનું સૌથી પહેલું અને સૌથી અસરકારક પગલું હાથ ધોવાનું છે. દરેક દર્દીને અડ્યા પહેલાં અને પછી હાથ સાબુથી ધોઉં છું અથવા સેનિટાઇઝર વાપરું છું. જરૂર પ્રમાણે ગ્લવ્ઝ, માસ્ક અને ગાઉન પહેરું છું અને દરેક દર્દી માટે નવા ગ્લવ્ઝ વાપરું છું. બધાં સાધનો વપરાશ પહેલાં અને પછી સ્ટરિલાઇઝ કરું છું. કચરો રંગ પ્રમાણેના અલગ ડબ્બામાં નાખું છું અને સોય-બ્લેડ ફક્ત શાર્પ કન્ટેનરમાં નાખું છું. દર્દીની ચાદર નિયમિત બદલું છું, અને સંક્રમિત દર્દીને અલગ રાખું છું.",
  en: "The first and most effective step to prevent infection is hand washing. I wash my hands with soap or use sanitiser before and after touching every patient. I wear gloves, a mask and a gown as required, and I use fresh gloves for each patient. I sterilise all instruments before and after use. I dispose of waste in the correct colour coded bins and put needles and blades only in the sharps container. I change the patient linen regularly, and I keep an infected patient in isolation.",
  tip: "«હાથ ધોવા» પહેલું બોલવું ફરજિયાત છે. તે ચૂકી ગયા તો નર્સિંગના ઇન્ટરવ્યુમાં તરત નકારાય છે."
},
{
  id: 3,
  cat: "દવા આપવી",
  q: "What precautions do you take before giving medicine to a patient?",
  kw: [["right patient", "patient name", "name", "identify", "confirm", "check patient", "bed number"], ["right drug", "medicine name", "label", "correct medicine", "drug"], ["dose", "dosage", "quantity", "amount", "strength"], ["route", "oral", "injection", "iv", "im", "time", "timing"], ["expiry", "expiry date", "expire", "allergy", "allergic", "record", "document", "chart", "doctor", "prescription"]],
  must: [
    { kw: ["right patient", "patient name", "name", "identify", "confirm", "bed number", "check patient"], gu: "સાચો દર્દી ઓળખવો" },
    { kw: ["allergy", "allergic", "reaction", "sensitiv"], gu: "એલર્જી પૂછવી / તપાસવી" }
  ],
  gu: "દવા આપતાં પહેલાં «પાંચ રાઇટ» તપાસું છું. પહેલું, સાચો દર્દી — નામ અને બેડ નંબર પૂછીને ખાતરી કરું છું. બીજું, સાચી દવા — લેબલ અને ડોક્ટરની પ્રિસ્ક્રિપ્શન સાથે સરખાવું છું. ત્રીજું, સાચો ડોઝ. ચોથું, સાચો રસ્તો — મોઢેથી, ઇન્જેક્શન કે IV. પાંચમું, સાચો સમય. તેની સાથે દવાની એક્સપાયરી ડેટ જોઉં છું અને દર્દીને કોઈ એલર્જી છે કે નહીં તે પૂછું છું. દવા આપ્યા પછી તરત રેકોર્ડમાં નોંધું છું અને દર્દી પર કોઈ પ્રતિક્રિયા દેખાય તો તરત નર્સ ઇન્ચાર્જ કે ડોક્ટરને જાણ કરું છું.",
  en: "Before giving medicine I check the five rights. First, the right patient, and I confirm by asking the name and checking the bed number. Second, the right drug, which I compare with the label and the doctor prescription. Third, the right dose. Fourth, the right route, whether oral, injection or IV. Fifth, the right time. Along with this I check the expiry date of the medicine and I ask the patient whether they have any allergy. After giving the medicine I record it immediately, and if I notice any reaction in the patient I inform the nurse in charge or the doctor at once.",
  tip: "«પાંચ રાઇટ» એ નામ સાથે બોલો અને પાંચેય ગણાવો. એલર્જી પૂછવાનું ચૂકશો નહીં."
},
{
  id: 4,
  cat: "પ્રાથમિક સારવાર",
  q: "A patient suddenly collapses in the ward. What will you do?",
  kw: [["response", "responsive", "conscious", "shout", "call name", "shake", "check response"], ["breathing", "breath", "pulse", "airway", "check"], ["cpr", "compression", "chest compression", "resuscitation", "30", "2"], ["doctor", "call", "help", "emergency", "code", "team", "shout for help", "inform"], ["position", "flat", "hard", "floor", "bed", "side", "recovery", "oxygen"]],
  must: [
    { kw: ["call", "help", "shout", "inform", "doctor", "emergency", "team", "code"], gu: "તરત મદદ બોલાવવી" },
    { kw: ["breathing", "breath", "pulse", "airway", "check response", "responsive", "conscious"], gu: "શ્વાસ અને પ્રતિક્રિયા તપાસવી" }
  ],
  gu: "પહેલાં જગ્યા સલામત છે તે જોઈને દર્દી પાસે જાઉં છું અને નામ બોલાવીને, ખભો હલાવીને પ્રતિક્રિયા તપાસું છું. પ્રતિક્રિયા ન મળે તો તરત મોટા સાદે મદદ બોલાવું છું અને ડોક્ટર તથા ઇમરજન્સી ટીમને જાણ કરાવું છું. પછી શ્વાસ અને પલ્સ તપાસું છું. શ્વાસ ન ચાલતો હોય તો દર્દીને સખત સપાટી પર સીધો સુવાડીને તાલીમ પ્રમાણે તરત CPR શરૂ કરું છું — ૩૦ ચેસ્ટ કમ્પ્રેશન અને ૨ શ્વાસ. શ્વાસ ચાલતો હોય પણ બેભાન હોય તો રિકવરી પોઝિશનમાં પડખે સુવાડું છું અને ઓક્સિજન તૈયાર રાખું છું. ડોક્ટર આવે ત્યાં સુધી દર્દી પાસે રહું છું અને બધું રેકોર્ડમાં નોંધું છું.",
  en: "First I make sure the area is safe, then I go to the patient and check the response by calling their name and shaking the shoulder. If there is no response I immediately shout for help and get the doctor and the emergency team informed. Then I check the breathing and the pulse. If the patient is not breathing, I lay them flat on a hard surface and start CPR immediately as per my training, thirty chest compressions and two breaths. If the patient is breathing but unconscious, I put them in the recovery position on their side and keep oxygen ready. I stay with the patient until the doctor arrives and I record everything.",
  tip: "ક્રમ આ જ રાખો: પ્રતિક્રિયા તપાસો → મદદ બોલાવો → શ્વાસ તપાસો → CPR. મદદ બોલાવવાનું ચૂકશો નહીં."
},
{
  id: 5,
  cat: "દર્દી સંભાળ",
  q: "What is a bed sore, and how do you prevent it?",
  kw: [["pressure", "sore", "bed sore", "bedsore", "ulcer", "wound"], ["long time", "same position", "one position", "lying", "immobile", "cannot move", "bedridden"], ["turn", "turning", "change position", "position change", "two hour", "2 hour", "every"], ["clean", "dry", "hygiene", "wash", "skin care", "moisture", "wet"], ["mattress", "air bed", "water bed", "pillow", "cushion", "massage", "nutrition", "protein", "diet"]],
  gu: "બેડ સોર એટલે પ્રેશર અલ્સર — દર્દી લાંબા સમય સુધી એક જ સ્થિતિમાં સૂતો રહે ત્યારે શરીરના જે ભાગ પર સતત દબાણ આવે છે, ત્યાં લોહીનો પ્રવાહ ઘટી જાય અને ચામડી તૂટીને ઘાવ પડે. તે ખાસ કરીને કમર, થાપા, એડી અને ખભા પર થાય. બચાવ માટે દર બે કલાકે દર્દીની સ્થિતિ બદલું છું. ચામડી સાફ અને સૂકી રાખું છું, કારણ કે ભીની ચામડી જલદી તૂટે. એર મેટ્રેસ કે ઓશીકાં વાપરીને દબાણ વહેંચું છું. હાડકાં પાસેની જગ્યાએ હળવો માલિશ કરું છું, ચાદર સીધી અને કરચલી વગરની રાખું છું, અને દર્દીને પ્રોટીનવાળો ખોરાક તથા પૂરતું પાણી મળે તે જોઉં છું.",
  en: "A bed sore, also called a pressure ulcer, happens when a patient lies in the same position for a long time. Continuous pressure on one part of the body reduces the blood flow, and the skin breaks down and forms a wound. It commonly happens on the lower back, hips, heels and shoulders. To prevent it I change the patient position every two hours. I keep the skin clean and dry, because wet skin breaks more easily. I use an air mattress or pillows to spread the pressure. I give a gentle massage around the bony areas, keep the bed sheet straight without wrinkles, and make sure the patient gets protein rich food and enough water.",
  tip: "«દર બે કલાકે સ્થિતિ બદલવી» એ સૌથી મહત્ત્વનો જવાબ છે — તે જરૂર બોલો."
},
{
  id: 6,
  cat: "સંવાદ",
  q: "How do you communicate with a patient who is frightened or in pain?",
  kw: [["calm", "calmly", "gentle", "soft", "polite", "kind", "smile"], ["listen", "listening", "ask", "understand", "patience", "patiently"], ["explain", "explaining", "simple", "language", "tell", "inform", "reassure", "confidence"], ["privacy", "dignity", "respect", "cover", "curtain", "family", "relative"], ["doctor", "inform", "report", "pain", "medicine", "help", "comfort", "position"]],
  gu: "પહેલાં દર્દી પાસે શાંતિથી બેસીને ધીમા અને નમ્ર અવાજે વાત કરું છું. તેમની વાત વચ્ચે અટકાવ્યા વગર પૂરી સાંભળું છું અને પૂછું છું કે દુખાવો ક્યાં અને કેટલો છે. પછી સાદી ભાષામાં — તેમની જ ભાષામાં — સમજાવું છું કે શું થવાનું છે અને કેમ થવાનું છે, જેથી ડર ઓછો થાય. દર્દીની પ્રાઇવસી અને માન સાચવું છું. જરૂર પડે તો કુટુંબીજનને પાસે રહેવા દઉં છું. દર્દીની સ્થિતિ આરામદાયક બનાવું છું અને દુખાવો વધુ હોય તો તરત ડોક્ટર કે નર્સ ઇન્ચાર્જને જાણ કરું છું. ખોટું આશ્વાસન કે ખોટું વચન કદી આપતો નથી.",
  en: "First I sit calmly near the patient and speak in a slow and gentle voice. I listen to them completely without interrupting, and I ask where the pain is and how much it is. Then I explain in simple language, in their own language, what is going to happen and why, so that their fear reduces. I protect the patient privacy and dignity. If needed I allow a family member to stay with them. I make the patient position comfortable, and if the pain is severe I immediately inform the doctor or the nurse in charge. I never give false reassurance or a false promise.",
  tip: "«ખોટું આશ્વાસન આપતો નથી» — આ મુદ્દો ઉમેરવાથી વ્યાવસાયિક પ્રામાણિકતા દેખાય છે."
},
{
  id: 7,
  cat: "ઇન્જેક્શન",
  q: "What is the difference between an intramuscular and an intravenous injection?",
  kw: [["intramuscular", "im", "muscle"], ["intravenous", "iv", "vein"], ["slow", "slowly", "gradual", "absorb", "absorption", "deltoid", "gluteal", "thigh"], ["fast", "quick", "immediate", "immediately", "direct", "blood", "bloodstream"], ["angle", "90", "ninety", "site", "needle", "size", "aspirate", "emergency"]],
  gu: "ઇન્ટ્રામસ્ક્યુલર એટલે IM ઇન્જેક્શન સ્નાયુમાં અપાય છે — જેમ કે ખભાના ડેલ્ટોઇડમાં, થાપાના ગ્લુટિયલમાં કે જાંઘમાં. તેમાં સોય ચામડીથી ૯૦ ડિગ્રીના ખૂણે નાખવામાં આવે છે અને દવા સ્નાયુમાંથી ધીમે ધીમે લોહીમાં શોષાય છે. ઇન્ટ્રાવીનસ એટલે IV ઇન્જેક્શન સીધું નસમાં અપાય છે, તેથી દવા તરત લોહીમાં પહોંચે અને તરત અસર કરે. તેથી ઇમરજન્સીમાં IV વપરાય છે. IV માં દવા ધીમે ધીમે આપવી પડે અને ખૂબ કાળજી રાખવી પડે, કારણ કે અસર તરત થાય છે અને પાછી લઈ શકાતી નથી.",
  en: "An intramuscular or IM injection is given into a muscle, for example the deltoid in the shoulder, the gluteal muscle in the hip, or the thigh. The needle is inserted at a ninety degree angle to the skin, and the medicine is absorbed slowly from the muscle into the blood. An intravenous or IV injection is given directly into a vein, so the medicine reaches the blood immediately and acts immediately. That is why IV is used in emergencies. In IV the medicine has to be given slowly and with great care, because the effect is immediate and it cannot be taken back.",
  tip: "બંનેની જગ્યા અને અસરની ઝડપ — એ બે મુદ્દા સરખાવો. એક-બે જગ્યાનાં નામ પણ આપો."
},
{
  id: 8,
  cat: "નોંધ અને રેકોર્ડ",
  q: "Why is proper documentation and record keeping important in nursing?",
  kw: [["record", "document", "documentation", "chart", "file", "write", "note"], ["doctor", "next", "shift", "handover", "team", "nurse", "continuity", "continue"], ["treatment", "medicine", "given", "history", "progress", "condition", "vital"], ["legal", "law", "court", "proof", "evidence", "protect", "responsibility"], ["mistake", "error", "safe", "safety", "double", "repeat", "time", "sign", "immediately"]],
  gu: "રેકોર્ડ સાચો અને પૂરો રાખવો ઘણાં કારણોસર જરૂરી છે. પહેલું, દર્દીની સંભાળ સળંગ ચાલે — બીજી શિફ્ટની નર્સ કે ડોક્ટર રેકોર્ડ જોઈને જાણી શકે કે શું અપાયું અને દર્દીની હાલત કેવી છે. બીજું, દવા બે વાર અપાઈ જવાની કે અપાયા વગર રહી જવાની ભૂલ ટળે. ત્રીજું, ડોક્ટર દર્દીની પ્રગતિ સમજીને સારવાર બદલી શકે. ચોથું, રેકોર્ડ કાનૂની દસ્તાવેજ છે — કોઈ તપાસ કે કેસ થાય તો તે પુરાવો બને છે અને નર્સનું પણ રક્ષણ કરે છે. તેથી હું દરેક નોંધ કામ કર્યા પછી તરત, સમય અને સહી સાથે લખું છું, અને જે કર્યું ન હોય તે કદી લખતો નથી.",
  en: "Keeping a correct and complete record is important for many reasons. First, it keeps the patient care continuous, because the nurse or doctor on the next shift can see from the record what was given and what the patient condition is. Second, it prevents mistakes like giving a medicine twice or missing it completely. Third, the doctor can understand the patient progress and change the treatment. Fourth, the record is a legal document, so if there is any enquiry or case it becomes evidence and it also protects the nurse. That is why I write every entry immediately after doing the work, with the time and my signature, and I never write something that I have not actually done.",
  tip: "«કાનૂની દસ્તાવેજ» અને «જે કર્યું ન હોય તે ન લખવું» — આ બે મુદ્દા ખૂબ પ્રભાવ પાડે છે."
},
{
  id: 9,
  cat: "શિફ્ટ અને ટીમ",
  q: "Are you willing to do night shifts and work on holidays?",
  kw: [["yes", "ready", "willing", "no problem", "comfortable", "prepared"], ["night", "shift", "rotation", "rotational", "duty"], ["patient", "care", "24", "twenty four", "hour", "always", "need", "profession", "service"], ["family", "support", "adjust", "manage", "arrange", "prepared", "understand"], ["sleep", "rest", "health", "plan", "advance", "inform", "responsib"]],
  gu: "સ્પષ્ટ «હા» કહો અને કારણ આપો. જેમ કે: «હા, હું નાઇટ શિફ્ટ અને રજાના દિવસે કામ કરવા તૈયાર છું. નર્સિંગ એવો વ્યવસાય છે જેમાં દર્દીને ચોવીસ કલાક સંભાળની જરૂર પડે છે, તેથી શિફ્ટમાં કામ કરવું આ કામનો ભાગ છે એ મને સમજાય છે. મારા કુટુંબને પણ આ ખબર છે અને તેમનો પૂરો સાથ છે. નાઇટ શિફ્ટ પછી પૂરતો આરામ લઈને હું ડ્યુટી પર સજાગ રહું છું.» ગોળ ગોળ કે અડધો જવાબ ન આપો — હોસ્પિટલ માટે આ પ્રશ્ન નિર્ણાયક હોય છે.",
  en: "Yes, I am ready to do night shifts and to work on holidays. Nursing is a profession where patients need care twenty four hours a day, so I understand that shift duty is a part of this job. My family also knows this and they fully support me. After a night shift I take proper rest so that I stay alert on duty.",
  tip: "આ પ્રશ્નમાં અસ્પષ્ટ જવાબ આપવાથી નોકરી જતી રહે છે. સ્પષ્ટ «હા» સાથે કારણ આપો."
},
{
  id: 10,
  cat: "નૈતિકતા",
  q: "You made a mistake in a patient's treatment. What will you do?",
  kw: [["accept", "admit", "own", "honest", "honestly", "true", "mistake", "error"], ["immediately", "at once", "right away", "without delay", "quickly"], ["inform", "report", "tell", "nurse in charge", "senior", "doctor", "sister"], ["patient", "check", "monitor", "observe", "condition", "safe", "safety", "harm", "care"], ["record", "document", "write", "learn", "again", "future", "careful", "hide"]],
  must: [
    { kw: ["inform", "report", "tell", "senior", "doctor", "nurse in charge", "sister", "supervisor"], gu: "તરત સિનિયર કે ડોક્ટરને જાણ કરવી" },
    { kw: ["not hide", "do not hide", "never hide", "not cover", "honest", "honestly", "accept", "admit", "true", "tell the truth"], gu: "ભૂલ છુપાવવી નહીં" }
  ],
  gu: "ભૂલ થાય તો હું તેને કદી છુપાવતો નથી, કારણ કે નર્સિંગમાં છુપાવેલી ભૂલથી દર્દીનો જીવ જોખમમાં આવી શકે. પહેલાં દર્દીની હાલત તપાસું છું અને તેમની સલામતી પર ધ્યાન આપું છું. પછી તરત નર્સ ઇન્ચાર્જ અને ડોક્ટરને પ્રામાણિકતાથી જાણ કરું છું, જેથી જરૂરી સારવાર તરત શરૂ થઈ શકે. પછી દર્દી પર સતત નજર રાખું છું અને હકીકત જેમ બની તેમ રેકોર્ડમાં નોંધું છું. છેલ્લે વિચારું છું કે ભૂલ કેમ થઈ અને ફરી ન થાય તે માટે શું બદલવું — જેમ કે દવા આપતાં પહેલાં પાંચ રાઇટ વધુ ધ્યાનથી તપાસવા.",
  en: "If I make a mistake I never hide it, because in nursing a hidden mistake can put the patient life in danger. First I check the patient condition and focus on their safety. Then I immediately and honestly inform the nurse in charge and the doctor, so that the necessary treatment can be started at once. After that I keep monitoring the patient closely and I record exactly what happened. Finally I think about why the mistake happened and what I should change so that it does not happen again, for example checking the five rights more carefully before giving medicine.",
  tip: "«છુપાવતો નથી» અને «તરત જાણ કરું છું» — આ બે વાક્યો ફરજિયાત છે. પ્રામાણિકતા આ પ્રશ્નનો પૂરો જવાબ છે."
}
]});
