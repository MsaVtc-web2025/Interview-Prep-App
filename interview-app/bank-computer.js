/* કમ્પ્યુટર કોર્સ — તકનીકી પ્રશ્ન બેંક (COPA / CCC સ્તર)
   must = ફરજિયાત મુદ્દા. આ ચૂકી જાય તો ચેતવણી મળે અને કુલ ગુણ મર્યાદિત થાય. */
registerCourse({
  id: "computer",
  name: "કમ્પ્યુટર",
  icon: "💻",
  tagline: "ઓફિસ, એક્સેલ, ઇન્ટરનેટ અને હાર્ડવેર",
  mode: "technical",
  questions: [
{
  id: 1,
  cat: "હાર્ડવેર",
  q: "What is the difference between RAM and a hard disk?",
  kw: [["ram"], ["hard disk", "hard drive", "hdd", "ssd", "storage"], ["temporary", "temporarily", "volatile", "erase", "lost", "clear"], ["permanent", "permanently", "save", "stored", "keeps"], ["power", "off", "shut", "switch"]],
  gu: "RAM એ કામચલાઉ મેમરી છે. કમ્પ્યુટર ચાલુ હોય ત્યારે જે પ્રોગ્રામ ચાલે છે તે RAM માં રહે છે, અને પાવર બંધ થતાં તે બધું ભૂંસાઈ જાય છે. હાર્ડ ડિસ્ક કાયમી સંગ્રહ છે — ફાઇલો, ફોટા અને સોફ્ટવેર તેમાં સચવાય છે અને પાવર બંધ થાય તો પણ રહે છે. RAM ઝડપી પણ નાની હોય, હાર્ડ ડિસ્ક ધીમી પણ મોટી હોય.",
  en: "RAM is temporary memory. The programs that are running stay in RAM, and everything in it is erased when the power goes off. A hard disk is permanent storage, so files, photos and software stay saved even after the computer is switched off. RAM is faster but smaller, and the hard disk is slower but much larger.",
  tip: "«કામચલાઉ» અને «કાયમી» એ બે શબ્દો જરૂર બોલો. ઇન્ટરવ્યુ લેનાર મુખ્યત્વે એ જ સાંભળવા માંગે છે."
},
{
  id: 2,
  cat: "MS એક્સેલ",
  q: "How do you add a column of numbers in MS Excel?",
  kw: [["sum", "autosum", "total"], ["formula", "function", "equal", "="], ["cell", "column", "range"], ["select", "click", "type", "drag"], ["enter", "result", "answer"]],
  gu: "જે ખાનામાં જવાબ જોઈએ છે ત્યાં ક્લિક કરો, પછી બરાબરની નિશાની સાથે SUM ફંક્શન લખો — જેમ કે =SUM(A1:A10). કૌંસમાં પહેલા અને છેલ્લા ખાનાનું નામ આપો, પછી Enter દબાવો. બીજી રીત એ છે કે આંકડાવાળાં ખાનાં પસંદ કરીને Home ટૅબમાંથી AutoSum દબાવો.",
  en: "First I click on the cell where I want the answer. Then I type the SUM formula, for example equals S-U-M open bracket A1 colon A10 close bracket, and press Enter. Another way is to select the numbers and click AutoSum in the Home tab.",
  tip: "ફોર્મ્યુલા બોલતી વખતે «equals», «open bracket», «colon» એમ સ્પષ્ટ બોલો — ફક્ત «A1 A10» ન બોલો."
},
{
  id: 3,
  cat: "ઓપરેટિંગ સિસ્ટમ",
  q: "What is an operating system? Give two examples.",
  kw: [["operating system", "os"], ["software", "program"], ["hardware", "computer", "machine"], ["windows"], ["android", "linux", "ubuntu", "mac", "ios"]],
  gu: "ઓપરેટિંગ સિસ્ટમ એ મુખ્ય સોફ્ટવેર છે જે કમ્પ્યુટરના હાર્ડવેર અને વપરાશકર્તા વચ્ચે કડી બનાવે છે. તે ફાઇલો સંભાળે છે, પ્રોગ્રામ ચલાવે છે અને સ્ક્રીન પર બધું બતાવે છે. તેના વગર કમ્પ્યુટર ચાલી શકે નહીં. ઉદાહરણ તરીકે Windows અને Android.",
  en: "An operating system is the main software that connects the computer hardware with the user. It manages files, runs programs and shows everything on the screen. Without it the computer cannot work. Two examples are Windows and Android.",
  tip: "બે ઉદાહરણ પુછ્યાં હોય તો બે જ આપો, અને નામ સ્પષ્ટ બોલો."
},
{
  id: 4,
  cat: "ઇન્ટરનેટ અને ઈમેલ",
  q: "How do you send an email with a file attached?",
  kw: [["compose", "new mail", "new email", "write"], ["address", "to", "recipient", "email id"], ["subject"], ["attach", "attachment", "clip", "paperclip", "upload"], ["send"]],
  gu: "પહેલાં Gmail ખોલીને Compose દબાવો. To ના ખાનામાં જેને મોકલવો છે તેનું ઈમેલ એડ્રેસ લખો, Subject માં વિષય લખો અને નીચે સંદેશો લખો. પછી પેપરક્લિપ જેવા Attach આઇકોન પર ક્લિક કરીને ફાઇલ પસંદ કરો. ફાઇલ ચઢી જાય પછી Send દબાવો.",
  en: "First I open Gmail and click on Compose. I type the receiver email address in the To box, write a subject, and type my message. Then I click the paperclip attach icon and select the file from my computer. After the file is uploaded, I click Send.",
  tip: "ક્રમ પ્રમાણે બોલો: To, Subject, સંદેશો, Attach, Send. તેનાથી પ્રેક્ટિકલ અનુભવ દેખાય છે."
},
{
  id: 5,
  cat: "સમસ્યા નિવારણ",
  q: "The printer is not printing. What will you check?",
  kw: [["power", "switch", "on", "plug"], ["cable", "usb", "connection", "wifi", "connected"], ["paper", "tray", "jam"], ["ink", "toner", "cartridge"], ["queue", "driver", "default", "restart", "settings"]],
  gu: "પહેલાં પ્રિન્ટરનો પાવર ચાલુ છે કે નહીં તે જુઓ. પછી કેબલ કે વાઇફાઇ જોડાણ તપાસો. ત્યાર બાદ ટ્રેમાં કાગળ છે કે નહીં અને કાગળ ફસાયો નથી તે ચકાસો. પછી શાહી કે ટોનર બાકી છે કે નહીં તે જુઓ. છેલ્લે કમ્પ્યુટરમાં પ્રિન્ટ ક્યુ તપાસો — સાચો પ્રિન્ટર ડિફોલ્ટ છે કે નહીં અને કોઈ જૂનું કામ અટકેલું નથી તે જુઓ.",
  en: "First I check whether the printer power is on. Then I check the cable or the wi-fi connection. After that I check if there is paper in the tray and no paper jam. Next I check the ink or toner level. Finally I check the print queue on the computer to see if the correct printer is selected and no old job is stuck.",
  tip: "સૌથી સહેલી બાબતથી શરૂ કરીને ક્રમશઃ આગળ વધો. આ રીત ઇન્ટરવ્યુમાં ખૂબ સારી ગણાય છે."
},
{
  id: 6,
  cat: "સલામતી",
  q: "What is a computer virus and how do you protect a computer from it?",
  kw: [["virus", "malware"], ["harmful", "damage", "corrupt", "delete", "steal", "slow"], ["file", "data", "program", "system"], ["update", "updated", "scan"], ["pen drive", "usb", "email", "link", "download", "website"]],
  must: [{ kw: ["antivirus", "anti virus", "anti-virus", "defender", "security software"], gu: "એન્ટિવાયરસ સોફ્ટવેર" }],
  gu: "વાયરસ એ નુકસાનકારક પ્રોગ્રામ છે જે કમ્પ્યુટરમાં ઘૂસીને ફાઇલો બગાડે છે, ડેટા ચોરે છે અથવા કમ્પ્યુટર ધીમું કરી નાખે છે. બચવા માટે એન્ટિવાયરસ સોફ્ટવેર નાખવું અને તેને નિયમિત અપડેટ રાખવું જરૂરી છે. અજાણી ઈમેલની લિંક કે ફાઇલ ખોલવી નહીં, અજાણી વેબસાઇટ પરથી સોફ્ટવેર ડાઉનલોડ કરવું નહીં, અને પેન ડ્રાઇવ વાપરતાં પહેલાં સ્કેન કરવી.",
  en: "A virus is a harmful program that enters the computer and damages files, steals data or makes the computer very slow. To protect the computer I install antivirus software and keep it updated. I do not open links or files from unknown emails, I do not download software from unknown websites, and I scan every pen drive before using it.",
  tip: "«એન્ટિવાયરસ» શબ્દ બોલવો ફરજિયાત છે. તેની સાથે «અપડેટ રાખવું» પણ ઉમેરો."
},
{
  id: 7,
  cat: "ડેટા સંભાળ",
  q: "How do you take a backup of important files?",
  kw: [["backup", "copy"], ["pen drive", "usb", "external", "hard disk", "dvd"], ["cloud", "google drive", "drive", "onedrive", "online"], ["regular", "regularly", "daily", "weekly", "schedule"], ["folder", "file", "important", "data"]],
  must: [{ kw: ["two", "second", "another", "more than one", "both", "also"], gu: "એકથી વધુ જગ્યાએ કોપી રાખવી" }],
  gu: "જરૂરી ફાઇલોની કોપી એકથી વધુ જગ્યાએ રાખવી જોઈએ. એક કોપી પેન ડ્રાઇવ કે એક્સટર્નલ હાર્ડ ડિસ્કમાં અને બીજી કોપી Google Drive જેવા ક્લાઉડમાં રાખું છું. બેકઅપ નિયમિત લેવો જરૂરી છે — દર અઠવાડિયે અથવા કામ પ્રમાણે દરરોજ. ફક્ત એક જ જગ્યાએ કોપી હોય તો તે બગડે ત્યારે ડેટા કાયમ માટે જતો રહે.",
  en: "Important files should be copied to more than one place. I keep one copy on a pen drive or an external hard disk, and a second copy in cloud storage like Google Drive. I take the backup regularly, every week or daily depending on the work. If there is only one copy and it gets damaged, the data is lost permanently.",
  tip: "«બે જગ્યાએ» એ મુખ્ય મુદ્દો છે. ફક્ત «પેન ડ્રાઇવમાં કોપી કરું છું» એ અધૂરો જવાબ છે."
},
{
  id: 8,
  cat: "MS ઓફિસ",
  q: "What is the difference between Save and Save As?",
  kw: [["save"], ["save as"], ["same", "existing", "original", "overwrite", "update"], ["new", "another", "different", "copy", "second"], ["name", "location", "folder", "format"]],
  gu: "Save એ જ ફાઇલમાં નવા ફેરફાર સાચવે છે — જૂનું લખાણ બદલાઈ જાય છે અને નામ એ જ રહે છે. Save As નવી ફાઇલ બનાવે છે, જેમાં આપણે નવું નામ, નવી જગ્યા કે નવો ફોર્મેટ પસંદ કરી શકીએ. મૂળ ફાઇલ સાચવી રાખવી હોય અને સાથે બીજી કોપી બનાવવી હોય તો Save As વાપરવું.",
  en: "Save keeps the changes in the same file, so the old version is replaced and the name stays the same. Save As creates a new file, where I can choose a new name, a new location or a different format. If I want to keep the original file and also make another copy, I use Save As.",
  tip: "બે વસ્તુ સરખાવવાની હોય ત્યારે «Save એ… જ્યારે Save As એ…» એવી રચનામાં બોલો."
},
{
  id: 9,
  cat: "MS વર્ડ",
  q: "In MS Word, how will you make a heading bold and centred?",
  kw: [["select", "highlight", "cursor", "drag"], ["bold", "ctrl b", "control b"], ["cent", "centre", "center", "middle", "align"], ["home", "tab", "toolbar", "ribbon"], ["ctrl", "control", "shortcut", "click"]],
  gu: "પહેલાં માઉસથી હેડિંગનું લખાણ પસંદ કરો. પછી Home ટૅબમાં B બટન દબાવો અથવા Ctrl અને B સાથે દબાવો, જેથી લખાણ બોલ્ડ થાય. પછી Center Align બટન દબાવો અથવા Ctrl અને E સાથે દબાવો, જેથી હેડિંગ વચ્ચે આવી જાય.",
  en: "First I select the heading text with the mouse. Then in the Home tab I click the B button, or press Control plus B, to make it bold. After that I click the centre align button, or press Control plus E, so the heading comes in the middle of the page.",
  tip: "શોર્ટકટ કી બોલવાથી પ્રેક્ટિકલ અનુભવ દેખાય છે. «Control plus B» એમ પૂરું બોલો."
},
{
  id: 10,
  cat: "ટાઇપિંગ અને ડેટા એન્ટ્રી",
  q: "What is your typing speed, and how do you make sure the data you enter is correct?",
  kw: [["speed", "words per minute", "wpm", "word", "minute"], ["accuracy", "accurate", "correct", "mistake", "error"], ["check", "checking", "verify", "recheck", "proofread", "read again"], ["slow", "careful", "carefully", "practice", "practise"], ["source", "document", "compare", "match", "original"]],
  gu: "તમારી ખરી ઝડપ આપો — જેમ કે મિનિટે ત્રીસ શબ્દ — અને પછી ચોકસાઈની વાત કરો. કહો કે ટાઇપ કર્યા પછી મૂળ કાગળ સાથે સરખાવીને ફરી વાંચી લો છો, ખાસ કરીને નામ, તારીખ અને આંકડા. ઉમેરો કે ઝડપ કરતાં ચોકસાઈ વધુ મહત્ત્વની છે અને રોજ પ્રેક્ટિસ કરીને ઝડપ વધારો છો.",
  en: "My typing speed is about thirty words per minute with good accuracy. After typing I always compare my work with the original document and read it again, especially the names, dates and numbers. I believe accuracy is more important than speed, and I practise daily to increase my speed.",
  tip: "ખોટી ઊંચી ઝડપ ન બોલો. સાચો આંકડો આપીને «ચોકસાઈ પહેલી» એમ કહેવું વધુ સારું લાગે છે."
}
]});
