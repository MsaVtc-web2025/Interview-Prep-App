/* પ્રશ્ન બેંકના નામોનું ભાષાંતર — Translations for question-bank labels.

   ડિઝાઇન: bank-*.js ફાઇલોમાં કંઈ બદલવું પડતું નથી. અહીં ગુજરાતી લખાણને
   ચાવી બનાવીને અંગ્રેજી અને હિન્દી આપી છે. ચાવી ન મળે તો ગુજરાતી જ દેખાય —
   એટલે નવો પ્રશ્ન ઉમેર્યા પછી એપ તૂટતી નથી, ફક્ત એ નામ ગુજરાતીમાં દેખાય.

   Keyed on the Gujarati source string; falls back to it when unmapped.
*/
"use strict";

/* કોર્સનું નામ અને ઓળખ — કોર્સના id પ્રમાણે */
const COURSE_I18N = {
  interview:   { en: { name: "Interview (general)", tagline: "Questions asked in every interview" },
                 hi: { name: "इंटरव्यू (सामान्य)",   tagline: "हर इंटरव्यू में पूछे जाने वाले प्रश्न" } },
  computer:    { en: { name: "Computer",            tagline: "Office, Excel, internet and hardware" },
                 hi: { name: "कंप्यूटर",             tagline: "ऑफ़िस, एक्सेल, इंटरनेट और हार्डवेयर" } },
  cnc:         { en: { name: "CNC machining",       tagline: "Machine setting, programs and safety" },
                 hi: { name: "CNC मशीनिंग",         tagline: "मशीन सेटिंग, प्रोग्राम और सुरक्षा" } },
  electrician: { en: { name: "Electrician",         tagline: "Wiring, safety and fault finding" },
                 hi: { name: "इलेक्ट्रिशियन",        tagline: "वायरिंग, सुरक्षा और ख़राबी ढूँढना" } },
  automotive:  { en: { name: "Automobile",          tagline: "Engine, brakes, service and diagnosis" },
                 hi: { name: "ऑटोमोबाइल",          tagline: "इंजन, ब्रेक, सर्विस और डायग्नोसिस" } },
  evehicle:    { en: { name: "E-vehicle",           tagline: "Battery, motor, charging and HV safety" },
                 hi: { name: "ई-वाहन",              tagline: "बैटरी, मोटर, चार्जिंग और हाई-वोल्टेज सुरक्षा" } },
  nursing:     { en: { name: "Nursing",             tagline: "Patient care, hygiene and first aid" },
                 hi: { name: "नर्सिंग",              tagline: "मरीज़ की देखभाल, स्वच्छता और प्राथमिक उपचार" } },
  welding:     { en: { name: "Welding",             tagline: "Arc, MIG, TIG and welding safety" },
                 hi: { name: "वेल्डिंग",             tagline: "आर्क, MIG, TIG और वेल्डिंग सुरक्षा" } }
};

/* પ્રશ્નનો વિભાગ (cat) */
const CAT_I18N = {
  "MS એક્સેલ":                        { en: "MS Excel",                    hi: "MS एक्सेल" },
  "MS ઓફિસ":                         { en: "MS Office",                   hi: "MS ऑफ़िस" },
  "MS વર્ડ":                          { en: "MS Word",                     hi: "MS वर्ड" },
  "અભ્યાસ અને નોકરીનું સંતુલન":        { en: "Balancing study and work",    hi: "पढ़ाई और नौकरी का संतुलन" },
  "ઇન્જેક્શન":                        { en: "Injections",                  hi: "इंजेक्शन" },
  "ઇન્ટરનેટ અને ઈમેલ":                { en: "Internet and email",          hi: "इंटरनेट और ईमेल" },
  "ઉદ્યોગની સમજ":                     { en: "Industry awareness",          hi: "उद्योग की समझ" },
  "એકાઉન્ટિંગ / ટેલી":                 { en: "Accounting / Tally",          hi: "अकाउंटिंग / टैली" },
  "એન્જિન":                           { en: "Engine",                      hi: "इंजन" },
  "ઓપરેટિંગ સિસ્ટમ":                  { en: "Operating system",            hi: "ऑपरेटिंग सिस्टम" },
  "કટિંગ પેરામીટર":                   { en: "Cutting parameters",          hi: "कटिंग पैरामीटर" },
  "કામની તૈયારી":                     { en: "Job preparation",             hi: "काम की तैयारी" },
  "કામની રીત":                        { en: "Way of working",              hi: "काम करने का तरीक़ा" },
  "કામનો અનુભવ":                      { en: "Work experience",             hi: "काम का अनुभव" },
  "કૂલન્ટ અને દેખરેખ":                 { en: "Coolant and maintenance",     hi: "कूलैंट और देखरेख" },
  "કૂલિંગ સિસ્ટમ":                     { en: "Cooling system",              hi: "कूलिंग सिस्टम" },
  "કૌટુંબિક પૃષ્ઠભૂમિ":                { en: "Family background",           hi: "पारिवारिक पृष्ठभूमि" },
  "ખામી":                             { en: "Defects",                     hi: "ख़राबी" },
  "ગુણવત્તા":                          { en: "Quality",                     hi: "गुणवत्ता" },
  "ગ્રાહક સેવા":                       { en: "Customer service",            hi: "ग्राहक सेवा" },
  "ચાર્જિંગ":                          { en: "Charging",                    hi: "चार्जिंग" },
  "ટાઇપિંગ અને ડેટા એન્ટ્રી":           { en: "Typing and data entry",       hi: "टाइपिंग और डेटा एंट्री" },
  "ટાયર":                             { en: "Tyres",                       hi: "टायर" },
  "ટૂલિંગ":                            { en: "Tooling",                     hi: "टूलिंग" },
  "ટ્રાન્સમિશન":                       { en: "Transmission",                hi: "ट्रांसमिशन" },
  "ડાયગ્નોસિસ":                        { en: "Diagnosis",                   hi: "डायग्नोसिस" },
  "ડિજિટલ પેમેન્ટ / વ્યવહારુ કૌશલ્ય":   { en: "Digital payments / life skills", hi: "डिजिटल पेमेंट / व्यावहारिक कौशल" },
  "ડેટા સંભાળ":                        { en: "Data care",                   hi: "डेटा की देखभाल" },
  "તકનીકી સમજ":                       { en: "Technical understanding",     hi: "तकनीकी समझ" },
  "તૈયારી":                            { en: "Preparation",                 hi: "तैयारी" },
  "દર્દી સંભાળ":                       { en: "Patient care",                hi: "मरीज़ की देखभाल" },
  "દવા આપવી":                         { en: "Giving medication",           hi: "दवा देना" },
  "નૈતિકતા":                          { en: "Ethics",                      hi: "नैतिकता" },
  "નોંધ અને રેકોર્ડ":                   { en: "Notes and records",           hi: "नोट और रिकॉर्ड" },
  "નોકરીની ભૂમિકા અને શિફ્ટ":          { en: "Job role and shifts",         hi: "नौकरी की भूमिका और शिफ़्ट" },
  "પગારની અપેક્ષા":                    { en: "Salary expectation",          hi: "वेतन की अपेक्षा" },
  "પ્રાથમિક સારવાર":                   { en: "First aid",                   hi: "प्राथमिक उपचार" },
  "પ્રોગ્રામિંગ":                       { en: "Programming",                 hi: "प्रोग्रामिंग" },
  "બેટરી સંભાળ":                       { en: "Battery care",                hi: "बैटरी की देखभाल" },
  "બેટરી":                             { en: "Battery",                     hi: "बैटरी" },
  "બ્રેક સિસ્ટમ":                       { en: "Brake system",                hi: "ब्रेक सिस्टम" },
  "મશીન સેટિંગ":                       { en: "Machine setting",             hi: "मशीन सेटिंग" },
  "માપણી":                            { en: "Measurement",                 hi: "मापन" },
  "મૂળભૂત":                           { en: "Fundamentals",                hi: "मूल बातें" },
  "મોટર":                             { en: "Motor",                       hi: "मोटर" },
  "રક્ષણ ઉપકરણ":                      { en: "Protection devices",          hi: "सुरक्षा उपकरण" },
  "રેઝ્યુમે / સ્વ-માહિતી":              { en: "Resume / about you",          hi: "रिज़्यूमे / स्व-जानकारी" },
  "વાયરિંગ":                           { en: "Wiring",                      hi: "वायरिंग" },
  "વેલ્ડિંગ પ્રકાર":                    { en: "Types of welding",            hi: "वेल्डिंग के प्रकार" },
  "વ્યક્તિગત પરિચય / વતન":            { en: "About you / hometown",        hi: "व्यक्तिगत परिचय / गृहनगर" },
  "શિક્ષણ અને લાયકાત":                 { en: "Education and qualifications", hi: "शिक्षा और योग्यता" },
  "શિફ્ટ અને ટીમ":                     { en: "Shifts and teamwork",         hi: "शिफ़्ट और टीम" },
  "શોખ":                              { en: "Hobbies",                     hi: "शौक़" },
  "સંક્રમણ નિયંત્રણ":                   { en: "Infection control",           hi: "संक्रमण नियंत्रण" },
  "સંવાદ":                            { en: "Communication",               hi: "संवाद" },
  "સમસ્યા નિવારણ":                    { en: "Troubleshooting",             hi: "समस्या निवारण" },
  "સર્કિટ":                            { en: "Circuits",                    hi: "सर्किट" },
  "સર્વિસ":                            { en: "Service",                     hi: "सर्विस" },
  "સલામતી":                           { en: "Safety",                      hi: "सुरक्षा" },
  "સિલિન્ડર સંભાળ":                    { en: "Cylinder handling",           hi: "सिलेंडर की देखभाल" },
  "સ્વ-પરિચય":                         { en: "Self-introduction",           hi: "स्व-परिचय" },
  "હાર્ડવેર":                          { en: "Hardware",                    hi: "हार्डवेयर" }
};

/* ફરજિયાત સલામતીના મુદ્દાનાં નામ (must) */
const MUST_I18N = {
  "ઇમરજન્સી સ્ટોપ બટન તપાસવું":
    { en: "Check the emergency stop button", hi: "इमरजेंसी स्टॉप बटन जाँचना" },
  "એકથી વધુ જગ્યાએ કોપી રાખવી":
    { en: "Keep copies in more than one place", hi: "एक से ज़्यादा जगह कॉपी रखना" },
  "એન્જિન ગરમ હોય ત્યારે રેડિયેટર કૅપ ન ખોલવી":
    { en: "Do not open the radiator cap while the engine is hot", hi: "इंजन गरम हो तो रेडिएटर कैप न खोलना" },
  "એન્ટિવાયરસ સોફ્ટવેર":
    { en: "Antivirus software", hi: "एंटीवायरस सॉफ़्टवेयर" },
  "એલર્જી પૂછવી / તપાસવી":
    { en: "Ask about and check for allergies", hi: "एलर्जी पूछना / जाँचना" },
  "ઓક્સિજન સિલિન્ડરને તેલ-ગ્રીસથી દૂર રાખવું":
    { en: "Keep oil and grease away from the oxygen cylinder", hi: "ऑक्सीजन सिलेंडर को तेल-ग्रीस से दूर रखना" },
  "ખુલ્લા હાથે વ્યક્તિને અડવું નહીં":
    { en: "Do not touch the person with bare hands", hi: "खुले हाथ से व्यक्ति को न छूना" },
  "ગાડીને જૅક સ્ટૅન્ડ કે ચૉકથી સ્થિર કરવી":
    { en: "Secure the vehicle with jack stands or chocks", hi: "गाड़ी को जैक स्टैंड या चॉक से स्थिर करना" },
  "ટેસ્ટરથી કરંટ નથી તે ખાતરી કરવી":
    { en: "Confirm with a tester that there is no current", hi: "टेस्टर से पुष्टि करना कि करंट नहीं है" },
  "તપાસ પહેલાં પાવર બંધ કરવો":
    { en: "Switch off the power before checking", hi: "जाँच से पहले पावर बंद करना" },
  "તપાસ પહેલાં સપ્લાય બંધ કરવો":
    { en: "Switch off the supply before checking", hi: "जाँच से पहले सप्लाई बंद करना" },
  "તરત ઇમરજન્સી સ્ટોપ દબાવવું":
    { en: "Press the emergency stop immediately", hi: "तुरंत इमरजेंसी स्टॉप दबाना" },
  "તરત મદદ બોલાવવી":
    { en: "Call for help immediately", hi: "तुरंत मदद बुलाना" },
  "તરત સિનિયર કે ડોક્ટરને જાણ કરવી":
    { en: "Inform a senior or the doctor immediately", hi: "तुरंत सीनियर या डॉक्टर को सूचित करना" },
  "પહેલાં સપ્લાય બંધ કરવો":
    { en: "Switch off the supply first", hi: "पहले सप्लाई बंद करना" },
  "ફાયર બ્રિગેડને બોલાવવી":
    { en: "Call the fire brigade", hi: "फ़ायर ब्रिगेड को बुलाना" },
  "બ્રેક ફ્લુઇડનું લેવલ કે લીકેજ તપાસવું":
    { en: "Check the brake fluid level and for leaks", hi: "ब्रेक फ़्लुइड का लेवल या लीकेज जाँचना" },
  "ભૂલ છુપાવવી નહીં":
    { en: "Never hide the mistake", hi: "ग़लती न छिपाना" },
  "મશીન પૂરું બંધ થાય ત્યાં સુધી દરવાજો ન ખોલવો કે હાથ અંદર ન નાખવો":
    { en: "Do not open the door or put your hand in until the machine has fully stopped",
      hi: "मशीन पूरी बंद होने तक दरवाज़ा न खोलना या हाथ अंदर न डालना" },
  "મુખ્ય સપ્લાય બંધ કરવો":
    { en: "Switch off the main supply", hi: "मुख्य सप्लाई बंद करना" },
  "યોગ્ય શેડનો ફિલ્ટર ગ્લાસ / હેલ્મેટ વાપરવો":
    { en: "Use a helmet with the correct shade of filter glass", hi: "सही शेड का फ़िल्टर ग्लास / हेल्मेट लगाना" },
  "લેધર ગ્લવ્ઝ":
    { en: "Leather gloves", hi: "लेदर ग्लव्स" },
  "લોકોને દૂર કરવા અને પોતે દૂર રહેવું":
    { en: "Move people away and stay at a safe distance yourself", hi: "लोगों को दूर करना और ख़ुद दूर रहना" },
  "વેલ્ડિંગ હેલ્મેટ / ફેસ શીલ્ડ":
    { en: "Welding helmet / face shield", hi: "वेल्डिंग हेल्मेट / फ़ेस शील्ड" },
  "શ્વાસ અને પ્રતિક્રિયા તપાસવી":
    { en: "Check breathing and responsiveness", hi: "साँस और प्रतिक्रिया जाँचना" },
  "સલામતી સાધનો (PPE) પહેરવાં":
    { en: "Wear safety equipment (PPE)", hi: "सुरक्षा उपकरण (PPE) पहनना" },
  "સાચો દર્દી ઓળખવો":
    { en: "Identify the right patient", hi: "सही मरीज़ की पहचान करना" },
  "સિલિન્ડર ઊભા રાખીને ચેઇનથી બાંધવા":
    { en: "Keep cylinders upright and chained", hi: "सिलेंडर खड़े रखकर चेन से बाँधना" },
  "હાઇ-વોલ્ટેજ ઇન્સ્યુલેટેડ ગ્લવ્ઝ પહેરવાં":
    { en: "Wear high-voltage insulated gloves", hi: "हाई-वोल्टेज इंसुलेटेड ग्लव्स पहनना" },
  "હાઇ-વોલ્ટેજ સર્વિસ ડિસ્કનેક્ટ કાઢીને સિસ્ટમ અલગ કરવી":
    { en: "Remove the high-voltage service disconnect to isolate the system",
      hi: "हाई-वोल्टेज सर्विस डिस्कनेक्ट निकालकर सिस्टम अलग करना" },
  "હાથ ધોવા / હેન્ડ હાઇજીન":
    { en: "Hand washing / hand hygiene", hi: "हाथ धोना / हैंड हाइजीन" }
};

/* ---------------- લુકઅપ ---------------- */

function pick(map, key, lang) {
  const row = map[key];
  if (!row) return key;                       // નકશામાં નથી → મૂળ ગુજરાતી
  if (lang === "gu") return key;
  return (row[lang] != null) ? row[lang] : key;
}

/* વિભાગનું નામ ચાલુ ભાષામાં */
function tCat(cat) { return pick(CAT_I18N, cat, getLang()); }

/* ફરજિયાત મુદ્દાનું નામ ચાલુ ભાષામાં */
function tMust(label) { return pick(MUST_I18N, label, getLang()); }

/* કોર્સનું નામ / ઓળખ ચાલુ ભાષામાં */
function tCourse(course, field) {
  const lang = getLang();
  if (lang === "gu") return course[field];
  const row = COURSE_I18N[course.id];
  if (row && row[lang] && row[lang][field] != null) return row[lang][field];
  return course[field];
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COURSE_I18N, CAT_I18N, MUST_I18N, tCat, tMust, tCourse };
}
