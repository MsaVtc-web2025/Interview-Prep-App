/* પ્રશ્ન બેંક — ઉમેદવારોના ડિબ્રીફ રેકોર્ડિંગમાંથી બનાવેલી.
   q  = પ્રશ્ન (અંગ્રેજીમાં, જેમ ઇન્ટરવ્યુમાં પુછાય છે)
   kw = અપેક્ષિત મુદ્દા (ચોકસાઈ માપવા માટે)
   gu = ગુજરાતીમાં નમૂનારૂપ જવાબ અને સમજૂતી
   en = અંગ્રેજીમાં આ રીતે બોલો
   tip = આ પ્રશ્ન માટે ખાસ સૂચન
*/
registerCourse({
  id: "interview",
  name: "ઇન્ટરવ્યુ (સામાન્ય)",
  icon: "💼",
  tagline: "દરેક ઇન્ટરવ્યુમાં પુછાતા પ્રશ્નો",
  mode: "interview",

  /* ખરા ઇન્ટરવ્યુના ક્રમમાં પ્રશ્નો પુછાય — આ યાદીમાં પ્રશ્નના id છે.
     ક્રમ: સ્વ-પરિચય → વતન → કુટુંબ → શિક્ષણ → શોખ → નોકરીની ભૂમિકા
           → સમય/શિફ્ટ → પગાર → વ્યવહારુ કૌશલ્ય → તકનીકી (ટેલી).
     ક્રમ બદલવો હોય તો ફક્ત આ એક લીટી બદલો. */
  order: [21, 17, 11, 12, 9, 10, 19, 18, 13, 14, 15, 16, 22, 20, 7, 8, 1, 2, 3, 4, 5, 6],
  greet: true,          // પહેલા પ્રશ્ન પહેલાં નામ સાથે અભિવાદન

  questions: [
{
  id: 1,
  cat: "એકાઉન્ટિંગ / ટેલી",
  q: "How do you make a purchase entry in Tally?",
  kw: [["purchase"], ["voucher", "f9", "entry"], ["supplier", "party", "creditor", "vendor"], ["amount", "gst", "tax", "rate"], ["ledger", "account", "save"]],
  gu: "ટેલીમાં પર્ચેસ એન્ટ્રી માટે Gateway of Tally માંથી Accounting Vouchers પસંદ કરો અને F9 (Purchase) દબાવો. પછી સપ્લાયરનું નામ, ઇન્વોઇસ નંબર અને તારીખ ભરો. ત્યાર બાદ ખરીદેલી વસ્તુ, જથ્થો અને રકમ નાખો, GST લાગુ પડતો હોય તો ઉમેરો, અને છેલ્લે Ctrl+A દબાવીને એન્ટ્રી સેવ કરો.",
  en: "To make a purchase entry in Tally, I go to Accounting Vouchers and press F9 for Purchase. I enter the supplier name, the invoice number and the date. Then I enter the item, quantity and amount, add GST if it applies, and save the entry using Ctrl plus A.",
  tip: "પગલાં ક્રમ પ્રમાણે બોલો. તેનાથી ઇન્ટરવ્યુ લેનારને લાગે છે કે તમને ખરેખર પ્રેક્ટિકલ અનુભવ છે."
},
{
  id: 2,
  cat: "એકાઉન્ટિંગ / ટેલી",
  q: "How are accounting entries made?",
  kw: [["debit", "dr"], ["credit", "cr"], ["account", "ledger"], ["equal", "same", "both", "two"], ["rule", "golden", "example"]],
  gu: "દરેક એન્ટ્રીમાં ડેબિટ અને ક્રેડિટ એમ બે બાજુ હોય છે, અને બંનેની રકમ સરખી હોવી જોઈએ. પહેલાં નક્કી કરો કે કયા બે ખાતાં અસર પામે છે, પછી ગોલ્ડન રૂલ્સ પ્રમાણે કયું ડેબિટ થશે અને કયું ક્રેડિટ તે નક્કી કરો.",
  en: "Every accounting entry has two sides, debit and credit, and both amounts must be equal. First I identify which two accounts are affected, then I apply the golden rules to decide which account to debit and which to credit. For example, if I buy goods for cash, the Purchase account is debited and the Cash account is credited.",
  tip: "એક નાનું ઉદાહરણ આપીને સમજાવશો તો જવાબ ઘણો મજબૂત લાગશે."
},
{
  id: 3,
  cat: "એકાઉન્ટિંગ / ટેલી",
  q: "What are the Golden Rules of Accounting?",
  kw: [["personal"], ["real"], ["nominal"], ["debit", "dr"], ["credit", "cr"], ["receiver", "comes", "expense", "giver", "goes", "income"]],
  gu: "ત્રણ પ્રકારના ખાતાં માટે ત્રણ નિયમો છે. પર્સનલ એકાઉન્ટ: મેળવનારને ડેબિટ, આપનારને ક્રેડિટ. રિયલ એકાઉન્ટ: જે આવે તે ડેબિટ, જે જાય તે ક્રેડિટ. નોમિનલ એકાઉન્ટ: ખર્ચ અને નુકસાન ડેબિટ, આવક અને નફો ક્રેડિટ.",
  en: "There are three golden rules. For personal accounts, debit the receiver and credit the giver. For real accounts, debit what comes in and credit what goes out. For nominal accounts, debit all expenses and losses, and credit all incomes and gains.",
  tip: "ત્રણેય નિયમો ક્રમમાં બોલો અને દરેક સાથે એક નાનું ઉદાહરણ આપો."
},
{
  id: 4,
  cat: "એકાઉન્ટિંગ / ટેલી",
  q: "What is a Contra voucher, and what entries are related to it?",
  kw: [["contra"], ["cash"], ["bank"], ["deposit", "withdraw", "transfer"], ["f4", "voucher"]],
  gu: "કોન્ટ્રા વાઉચર એવા વ્યવહારો માટે વપરાય છે જેમાં ફક્ત રોકડ અને બેંક વચ્ચે પૈસાની હેરફેર થાય છે. જેમ કે બેંકમાં રોકડ જમા કરાવવી, બેંકમાંથી રોકડ ઉપાડવી, અથવા એક બેંક ખાતામાંથી બીજા ખાતામાં ટ્રાન્સફર કરવું. ટેલીમાં તેની શોર્ટકટ કી F4 છે.",
  en: "A contra voucher is used when money moves only between cash and bank. For example, depositing cash into the bank, withdrawing cash from the bank, or transferring money from one bank account to another. In Tally the shortcut key for contra is F4.",
  tip: "ઉમેરો કે આ એન્ટ્રીથી કંપનીની કુલ મૂડી બદલાતી નથી — પૈસા ફક્ત એક જગ્યાએથી બીજી જગ્યાએ જાય છે."
},
{
  id: 5,
  cat: "એકાઉન્ટિંગ / ટેલી",
  q: "What is bank reconciliation?",
  kw: [["bank"], ["statement", "passbook"], ["book", "books", "ledger"], ["match", "compare", "difference", "tally"], ["cheque", "charges", "cleared", "month"]],
  gu: "બેંક રીકન્સીલેશન એટલે આપણા ચોપડામાં લખેલા બેંક ખાતાના આંકડા અને બેંકના સ્ટેટમેન્ટના આંકડા સરખાવવા. બંને વચ્ચે ફરક હોય તો તેનું કારણ શોધવું — જેમ કે ચેક લખાયો હોય પણ હજી બેંકમાં પાસ ન થયો હોય, અથવા બેંકે ચાર્જ કાપ્યો હોય જે આપણે નોંધ્યો ન હોય.",
  en: "Bank reconciliation means comparing the bank balance shown in our books with the balance shown in the bank statement. If there is a difference, I find the reason, such as a cheque that is issued but not yet cleared, or bank charges that are not yet recorded in our books. It is usually done every month.",
  tip: "છેલ્લે ઉમેરો કે આ કામ સામાન્ય રીતે દર મહિને થાય છે — તેનાથી પ્રેક્ટિકલ સમજ દેખાય છે."
},
{
  id: 6,
  cat: "એકાઉન્ટિંગ / ટેલી",
  q: "What was taught in your Tally training?",
  kw: [["company", "create"], ["ledger", "group"], ["voucher", "entry", "entries"], ["gst", "tax"], ["report", "balance", "profit"]],
  gu: "તમે શું શીખ્યા તે ક્રમમાં જણાવો — કંપની બનાવવી, લેજર અને ગ્રુપ બનાવવા, વાઉચર એન્ટ્રી, GST, અને રિપોર્ટ જોવા. છેલ્લે એક વાક્યમાં કહો કે તમે કઈ બાબતમાં સૌથી વધુ આરામદાયક છો.",
  en: "In my Tally training I learned how to create a company, how to create ledgers and groups, and how to pass voucher entries like purchase, sales, payment, receipt and contra. I also learned GST entries and how to view reports like the balance sheet and the profit and loss account. I am most comfortable with purchase and sales entries.",
  tip: "યાદી લાંબી કરવા કરતાં જે ખરેખર આવડે છે તે જ કહો — તેના પર આગળ પ્રશ્ન પુછાઈ શકે છે."
},
{
  id: 7,
  cat: "ડિજિટલ પેમેન્ટ / વ્યવહારુ કૌશલ્ય",
  q: "How do you make an online transaction? Walk me through the steps.",
  kw: [["app", "application", "phonepe", "gpay", "google", "paytm"], ["open", "login", "scan"], ["amount", "enter"], ["upi", "pin", "password", "otp"], ["confirm", "send", "payment", "receipt"]],
  gu: "પગલાં ક્રમમાં જણાવો: પહેલાં એપ ખોલો, પછી જેને પૈસા મોકલવાના છે તેનો QR કોડ સ્કેન કરો અથવા મોબાઇલ નંબર નાખો, રકમ ભરો, UPI પિન નાખો અને પેમેન્ટ કન્ફર્મ કરો. છેલ્લે સ્ક્રીન પર કન્ફર્મેશન અથવા રસીદ આવે છે તે ચેક કરો.",
  en: "First I open the payment app, then I scan the QR code or enter the mobile number of the person I want to pay. Next I enter the amount, check the details once, and enter my UPI PIN to confirm. After that I get a confirmation message on the screen showing the payment is successful.",
  tip: "ઇન્ટરવ્યુમાં ઘણી વાર ફોન આપીને કરી બતાવવાનું કહે છે — તેથી પગલાં બોલતાં બોલતાં હાથથી બતાવવાની પ્રેક્ટિસ કરો."
},
{
  id: 8,
  cat: "ડિજિટલ પેમેન્ટ / વ્યવહારુ કૌશલ્ય",
  q: "Which apps do you use for online transactions, and how do you use them?",
  kw: [["phonepe", "gpay", "google pay", "paytm", "bhim", "upi"], ["scan", "qr", "number"], ["bank", "account", "linked"], ["shopping", "bill", "recharge", "transfer"]],
  gu: "તમે ખરેખર વાપરતા હો તે એપનાં નામ આપો — જેમ કે Google Pay, PhonePe અથવા Paytm. પછી ટૂંકમાં કહો કે તે તમારા બેંક ખાતા સાથે જોડાયેલી છે અને તમે તેનાથી શું કરો છો: દુકાનમાં પેમેન્ટ, મોબાઇલ રિચાર્જ, બિલ ભરવું કે કોઈને પૈસા મોકલવા.",
  en: "I mainly use Google Pay and PhonePe. Both are linked to my bank account through UPI. I use them to pay at shops by scanning the QR code, to recharge my mobile, to pay bills, and to send money to my family and friends.",
  tip: "ફક્ત નામ ગણાવીને અટકી ન જાવ — દરેક એપનો ઉપયોગ શેના માટે કરો છો તે એક વાક્યમાં કહો."
},
{
  id: 9,
  cat: "શિક્ષણ અને લાયકાત",
  q: "What is your educational qualification, and up to what level have you studied?",
  kw: [["bcom", "b com", "bachelor", "graduate", "llb", "hsc", "diploma", "degree"], ["university", "college", "school"], ["year", "passed", "completed", "pursuing"], ["percentage", "marks", "grade", "subject"]],
  gu: "સીધો અને સ્પષ્ટ જવાબ આપો: તમારી સૌથી ઊંચી ડિગ્રી, કઈ યુનિવર્સિટી કે કૉલેજમાંથી, અને કયા વર્ષે પૂરી કરી. જો હજી અભ્યાસ ચાલુ હોય તો કયા વર્ષમાં છો તે જણાવો.",
  en: "I have completed my B.Com from Gujarat University in 2024. Along with that I have also done a Tally course. At present I am pursuing my LLB, and I am in the first year.",
  tip: "ડિગ્રીનું પૂરું નામ બોલો. ફક્ત 'B.Com' કહીને અટકવા કરતાં યુનિવર્સિટી અને વર્ષ પણ ઉમેરો."
},
{
  id: 10,
  cat: "શિક્ષણ અને લાયકાત",
  q: "Where did you obtain your degree from?",
  kw: [["university", "college"], ["gujarat", "ahmedabad", "name"], ["degree", "bcom", "graduation"], ["year", "passed", "completed"]],
  gu: "કૉલેજ અને યુનિવર્સિટીનું પૂરું નામ બોલો, અને સાથે વર્ષ પણ જણાવો. એક વાક્યમાં જવાબ પૂરો કરવાને બદલે પૂરું વાક્ય બનાવો.",
  en: "I completed my degree from Gujarat University. I studied at H.A. College of Commerce in Ahmedabad, and I passed my B.Com in 2024.",
  tip: "ફક્ત શહેરનું નામ ન કહો — સંસ્થાનું નામ સ્પષ્ટ બોલો, કારણ કે ઇન્ટરવ્યુ લેનાર તે નોંધે છે."
},
{
  id: 11,
  cat: "કૌટુંબિક પૃષ્ઠભૂમિ",
  q: "Tell me about your family background — what do your parents do, and how many members are in your family?",
  kw: [["family", "members", "four", "five", "three"], ["father", "papa"], ["mother", "mom"], ["brother", "sister", "sibling"], ["work", "job", "business", "housewife", "homemaker"]],
  gu: "કુલ કેટલા સભ્યો છે તેનાથી શરૂ કરો, પછી પિતા શું કરે છે, માતા શું કરે છે, અને ભાઈ-બહેન વિશે ટૂંકમાં જણાવો. બે થી ત્રણ પૂરાં વાક્યો પૂરતાં છે — વધારે વિગતમાં જવાની જરૂર નથી.",
  en: "There are four members in my family. My father works in a private company, and my mother is a homemaker. I have one younger sister who is studying in the twelfth standard. We all live together in Ahmedabad.",
  tip: "આ પ્રશ્ન તમારી સ્થિરતા જાણવા પુછાય છે. શાંતિથી, ટૂંકમાં અને આત્મવિશ્વાસથી જવાબ આપો."
},
{
  id: 12,
  cat: "કૌટુંબિક પૃષ્ઠભૂમિ",
  q: "How many siblings do you have, and what do they do?",
  kw: [["brother", "sister", "sibling", "one", "two"], ["elder", "younger"], ["study", "studying", "college", "school", "work", "job"]],
  gu: "કેટલા ભાઈ-બહેન છે તે કહો, પછી દરેક મોટા છે કે નાના અને હાલમાં શું કરે છે તે જણાવો. જો ભાઈ-બહેન ન હોય તો સ્પષ્ટ કહો કે તમે એકના એક છો.",
  en: "I have one elder brother and one younger sister. My brother works in a private company in Ahmedabad, and my sister is studying in college. We are a close family and they support my decisions.",
  tip: "ફક્ત સંખ્યા બોલીને અટકશો નહીં — દરેક શું કરે છે તે એક વાક્યમાં ઉમેરો."
},
{
  id: 13,
  cat: "નોકરીની ભૂમિકા અને શિફ્ટ",
  q: "What is Domestic Voice?",
  kw: [["domestic", "india", "indian", "country"], ["voice", "call", "calls", "phone"], ["customer", "client"], ["language", "hindi", "english"], ["process", "support", "query"]],
  gu: "ડોમેસ્ટિક વોઈસ એટલે એવી પ્રક્રિયા જેમાં ફોન પર ભારતના જ ગ્રાહકો સાથે વાત કરવાની હોય છે. ગ્રાહકના પ્રશ્નો સાંભળીને હિન્દી, અંગ્રેજી કે સ્થાનિક ભાષામાં જવાબ આપવાનો હોય છે. તેની સામે ઇન્ટરનેશનલ પ્રોસેસમાં વિદેશના ગ્રાહકો સાથે વાત કરવાની હોય છે.",
  en: "Domestic voice means a process where we speak with customers who are within India, over the phone. We listen to their questions or complaints and solve them in Hindi or English. It is different from an international process, where we handle customers from other countries.",
  tip: "ડોમેસ્ટિક અને ઇન્ટરનેશનલ વચ્ચેનો ફરક જણાવશો તો જવાબ પૂરો ગણાશે."
},
{
  id: 14,
  cat: "નોકરીની ભૂમિકા અને શિફ્ટ",
  q: "Are you willing to work night shifts?",
  kw: [["yes", "no", "willing", "ready", "comfortable"], ["night", "shift"], ["family", "permission", "support"], ["transport", "travel", "cab", "safe"]],
  gu: "સીધો જવાબ આપો — હા કે ના. જો હા હોય તો ઉમેરો કે ઘરેથી પરવાનગી છે અને આવવા-જવાની વ્યવસ્થા છે. જો ના હોય તો નમ્રતાથી કારણ જણાવો અને કઈ શિફ્ટ ફાવે તે કહો. ખોટું 'હા' કહેવા કરતાં પ્રામાણિક જવાબ સારો.",
  en: "Yes, I am comfortable working night shifts. I have already discussed this with my family and they are supportive. As long as transport facility is provided, I will be able to reach on time and work regularly.",
  tip: "'હા' કહો તો કારણ પણ આપો. ફક્ત 'હા' બોલવાથી જવાબ અધૂરો લાગે છે."
},
{
  id: 15,
  cat: "નોકરીની ભૂમિકા અને શિફ્ટ",
  q: "What is the difference between a Voice and a Non-Voice process?",
  kw: [["voice", "call", "talk", "speak", "phone"], ["non-voice", "non voice", "chat", "email", "back office"], ["customer"], ["write", "written", "typing"]],
  gu: "વોઈસ પ્રોસેસમાં ફોન પર ગ્રાહક સાથે સીધી વાત કરવાની હોય છે, તેથી બોલવાની આવડત જરૂરી છે. નોન-વોઈસ પ્રોસેસમાં વાત કરવાની હોતી નથી — તેમાં ચેટ, ઈમેલ કે બેક ઓફિસનું કામ હોય છે, તેથી લખવાની અને ટાઇપિંગની આવડત જરૂરી છે.",
  en: "In a voice process we talk to customers directly on the phone, so good speaking and listening skills are important. In a non-voice process we do not speak to customers. Instead we handle chats, emails or back office work, so writing and typing skills are more important.",
  tip: "બંને માટે કઈ આવડત જોઈએ તે ઉમેરો — તેનાથી તમારી સમજ ઊંડી લાગે છે."
},
{
  id: 16,
  cat: "નોકરીની ભૂમિકા અને શિફ્ટ",
  q: "What is VOIS?",
  kw: [["vois", "vodafone", "intelligent", "solutions"], ["company", "organisation", "organization"], ["service", "shared", "global", "technology"], ["india", "pune", "ahmedabad"]],
  gu: "VOIS એટલે Vodafone Intelligent Solutions. તે Vodafone ગ્રુપનું એક કેન્દ્ર છે જે ટેકનોલોજી, ગ્રાહક સેવા અને બીજી ઘણી સેવાઓ દુનિયાભરની Vodafone કંપનીઓને પૂરી પાડે છે. ભારતમાં તેની મોટી ઓફિસો છે.",
  en: "VOIS stands for Vodafone Intelligent Solutions. It is a part of the Vodafone Group that provides technology, customer service and business support to Vodafone companies across the world. It has large centres in India.",
  tip: "ઇન્ટરવ્યુ પહેલાં કંપનીનું પૂરું નામ અને તે શું કરે છે તે ચોક્કસ જોઈ લો — આ પ્રશ્ન લગભગ દરેક વખતે પુછાય છે."
},
{
  id: 17,
  cat: "વ્યક્તિગત પરિચય / વતન",
  q: "Tell me about your hometown — where are you from?",
  kw: [["from", "belong", "born", "live"], ["city", "town", "village", "district"], ["ahmedabad", "gujarat", "rajkot", "surat", "vadodara"], ["famous", "known", "family", "years"]],
  gu: "તમારું શહેર કે ગામ કયું છે તેનાથી શરૂ કરો, પછી તે કયા જિલ્લામાં આવેલું છે અને શેના માટે જાણીતું છે તે એક વાક્યમાં કહો. છેલ્લે જણાવો કે તમે ત્યાં કેટલા સમયથી રહો છો.",
  en: "I am from Ahmedabad, which is the largest city in Gujarat. It is well known for its textile industry and for historical places like the Sabarmati Ashram. I have been living here with my family since my childhood.",
  tip: "એક વાક્યમાં ગામ કે શહેરની ખાસિયત ઉમેરો — તેનાથી જવાબ યાદ રહી જાય તેવો બને છે."
},
{
  id: 18,
  cat: "શોખ",
  q: "What are your hobbies? What are you interested in?",
  kw: [["reading", "writing", "music", "sports", "cooking", "drawing", "cricket", "travel"], ["free time", "spare time", "hobby", "like", "enjoy"], ["because", "helps", "learn", "relax"]],
  gu: "એક કે બે શોખ જણાવો અને દરેક સાથે એક ટૂંકું કારણ આપો કે તે તમને કેમ ગમે છે. ખોટા શોખ ન કહો — તેના પર આગળ પ્રશ્ન પુછાઈ શકે છે, જેમ કે 'છેલ્લે કયું પુસ્તક વાંચ્યું?'",
  en: "My hobbies are reading books and writing. I usually read in my free time because it helps me improve my English and learn new things. I also enjoy writing short articles, which helps me express my thoughts clearly.",
  tip: "શોખને નોકરી સાથે જોડો — જેમ કે વાંચનથી અંગ્રેજી સુધરે છે. તેનાથી જવાબ વધુ અસરકારક બને છે."
},
{
  id: 19,
  cat: "રેઝ્યુમે / સ્વ-માહિતી",
  q: "What did you write in the 'About Me' section of your resume?",
  kw: [["about", "resume", "wrote", "mentioned"], ["hardworking", "honest", "quick", "learner", "punctual", "responsible"], ["skill", "tally", "computer", "communication"], ["career", "grow", "opportunity", "goal"]],
  gu: "રેઝ્યુમેમાં જે લખ્યું હોય તે જ બોલો — બે થી ત્રણ મુદ્દા પૂરતા છે: તમારો સ્વભાવ, તમારી મુખ્ય આવડત, અને તમારો ધ્યેય. જવાબ રેઝ્યુમે સાથે મેળ ખાવો જોઈએ, નહીંતર ખોટી છાપ પડે છે.",
  en: "In the About Me section I have written that I am a hardworking and honest person who learns quickly. I have mentioned my knowledge of Tally and basic computer skills. I have also written that I am looking for an opportunity where I can use my skills and grow with the company.",
  tip: "ઇન્ટરવ્યુ પહેલાં પોતાનું રેઝ્યુમે એક વાર વાંચી લો — તેમાંથી જ પ્રશ્નો પુછાય છે."
},
{
  id: 20,
  cat: "પગારની અપેક્ષા",
  q: "What is your salary expectation?",
  kw: [["thousand", "15", "18", "20", "salary", "expectation"], ["month", "monthly", "per"], ["company", "standard", "policy", "norms"], ["learn", "experience", "grow", "first"]],
  gu: "ફક્ત આંકડો બોલીને અટકશો નહીં — પૂરું વાક્ય બનાવો. એક શ્રેણી આપો (જેમ કે ૧૫,૦૦૦ થી ૨૦,૦૦૦), પછી ટૂંકું કારણ આપો, અને છેલ્લે ઉમેરો કે તમે કંપનીના ધોરણ પ્રમાણે વાત કરવા તૈયાર છો.",
  en: "As this is my first job, my main focus is on learning and gaining experience. Considering the market rate for this role, I am expecting between fifteen thousand and twenty thousand rupees per month. However, I am flexible and open to the company's standard package.",
  tip: "આ પ્રશ્નમાં સૌથી મોટી ભૂલ એક જ શબ્દમાં જવાબ આપવો છે. કારણ સાથે પૂરું વાક્ય બોલો."
},
{
  id: 21,
  cat: "સ્વ-પરિચય",
  q: "Tell me about yourself. Give me a short self-introduction.",
  kw: [["name", "myself", "i am"], ["from", "live", "city"], ["education", "bcom", "graduate", "completed", "study"], ["skill", "tally", "computer", "course"], ["family", "hobby", "looking", "opportunity"]],
  gu: "આ ક્રમમાં બોલો: નામ, તમે ક્યાંના છો, શિક્ષણ, કોઈ કોર્સ કે આવડત, અને છેલ્લે તમે આ નોકરી કેમ ઇચ્છો છો. આખો જવાબ આશરે ત્રીસ થી પિસ્તાળીસ સેકન્ડનો રાખો. 'Myself Ravi' બોલવાને બદલે 'My name is Ravi' બોલો — આ સૌથી સામાન્ય ભૂલ છે.",
  en: "My name is Ravi Patel and I am from Ahmedabad. I have completed my B.Com from Gujarat University in 2024, and I have also done a Tally course. I live with my family, and in my free time I like reading books. I am now looking for an opportunity where I can start my career and grow with the company.",
  tip: "આ પ્રશ્ન લગભગ દરેક ઇન્ટરવ્યુમાં પહેલો પુછાય છે. તેને લખીને, મોટેથી, ઓછામાં ઓછી દસ વાર પ્રેક્ટિસ કરો."
},
{
  id: 22,
  cat: "અભ્યાસ અને નોકરીનું સંતુલન",
  q: "How will you manage a job alongside your studies — full-time or part-time?",
  kw: [["manage", "balance", "handle"], ["study", "studies", "college", "exam"], ["full time", "full-time", "part time", "part-time"], ["evening", "morning", "weekend", "night", "shift"], ["plan", "time", "schedule", "priority"]],
  gu: "સ્પષ્ટ યોજના જણાવો: તમારી કૉલેજનો સમય કયો છે, તમે કઈ શિફ્ટમાં કામ કરી શકશો, અને પરીક્ષા વખતે શું કરશો. ગોળ ગોળ જવાબ ન આપો — ઇન્ટરવ્યુ લેનાર એ જાણવા માંગે છે કે તમે નોકરી નિયમિત કરી શકશો કે નહીં.",
  en: "My college classes are in the morning and they finish by twelve o'clock. So I can comfortably work in the afternoon or evening shift on a full-time basis. I have already planned my study time at night, and during exams I will inform my manager well in advance.",
  tip: "ચોક્કસ સમય જણાવો. 'હું મેનેજ કરી લઈશ' એવો અસ્પષ્ટ જવાબ નબળો ગણાય છે."
}
]});

