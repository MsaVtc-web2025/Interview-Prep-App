/// <reference path="../pb_data/types.d.ts" />

/* Interview Prep — બૅકએન્ડનું ઢાંચું (schema).

   આ PocketBase migration છે. `pb_migrations/` માં મૂકીને સર્વર ચાલુ કરો
   એટલે જાતે લાગુ થઈ જાય છે. હાથે admin UI માં કંઈ બનાવવાનું નથી.

   ડિઝાઇનના ત્રણ મુદ્દા, જે બદલતાં પહેલાં સમજવા જરૂરી છે:

   1. વિદ્યાર્થીના જવાબનું લખાણ સર્વર પર કદી આવતું નથી. ફક્ત ગુણ, માપદંડ
      અને સમય આવે છે. `progress` માં જવાબનું કોઈ ખાનું જ નથી — તેથી ભૂલથી
      મોકલાય તો પણ સચવાય નહીં.

   2. «કોણ બધું જોઈ શકે» એ `instructors` નામના અલગ collection થી નક્કી થાય
      છે, `users` માં role રાખીને નહીં. કારણ: PocketBase માં ખાના-દીઠ
      (field-level) નિયમ નથી. role જો users માં હોય તો વિદ્યાર્થી પોતાનો
      record અપડેટ કરીને પોતાને instructor બનાવી શકે અને આખા વર્ગની
      માહિતી જોઈ શકે. `instructors` પર કોઈ API નિયમ ખુલ્લો નથી (બધા null),
      તેથી ફક્ત superuser જ admin UI માંથી કોઈને instructor બનાવી શકે.

   3. `progress` ફક્ત ઉમેરાય છે (append-only) — update નો નિયમ null છે.
      દરેક record સાથે `cid` (client id) આવે છે અને (user, cid) પર unique
      index છે. તેથી ફોન ઇન્ટરનેટ ન હોય ત્યારે કતારમાં રાખેલો જવાબ ફરી ફરી
      મોકલે તો પણ બમણો સંગ્રહાતો નથી.
*/

migrate((app) => {

  const usersId = app.findCollectionByNameOrId("users").id;

  /* ---------- batches — વર્ગ / બૅચ ---------- */
  const batches = new Collection({
    name: "batches",
    type: "base",
    // કોઈ પણ સાઇન-ઇન થયેલો વિદ્યાર્થી બૅચનું નામ વાંચી શકે; બનાવવા-બદલવાનું
    // ફક્ત superuser પાસે (નિયમ null = ફક્ત admin UI / superuser ટોકન).
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { type: "text", name: "name", required: true, max: 120, presentable: true },
      { type: "text", name: "institute", max: 160 },
      { type: "text", name: "year", max: 20 },
      { type: "text", name: "notes", max: 500 },
      { type: "autodate", name: "created", onCreate: true, onUpdate: false },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  });
  app.save(batches);

  /* ---------- instructors — કોણ આખો વર્ગ જોઈ શકે ---------- */
  const instructors = new Collection({
    name: "instructors",
    type: "base",
    // બધા નિયમ null: આ યાદી ફક્ત superuser બદલી શકે. બીજા collection ના
    // નિયમો અંદરથી @collection.instructors વાંચે છે — એ join સર્વર પર થાય
    // છે અને આ નિયમોથી બંધાયેલો નથી.
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        type: "relation", name: "user", required: true,
        collectionId: usersId, cascadeDelete: true, maxSelect: 1, presentable: true
      },
      {
        // ખાલી હોય તો બધા બૅચ દેખાય; ભરેલું હોય તો ફક્ત એ બૅચ.
        // (નિયમમાં આ વપરાયું નથી — dashboard આના પરથી ગાળે છે.)
        type: "relation", name: "batches",
        collectionId: batches.id, cascadeDelete: false, maxSelect: 0
      },
      { type: "text", name: "note", max: 200 },
      { type: "autodate", name: "created", onCreate: true, onUpdate: false }
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_instructors_user` ON `instructors` (`user`)"
    ]
  });
  app.save(instructors);

  /* ---------- progress — એક જવાબનો ગુણ અને સમય ---------- */
  const progress = new Collection({
    name: "progress",
    type: "base",

    // વિદ્યાર્થી પોતાના record જુએ; instructor બધા જુએ.
    listRule: 'user = @request.auth.id || @request.auth.id ?= @collection.instructors.user',
    viewRule: 'user = @request.auth.id || @request.auth.id ?= @collection.instructors.user',

    // પોતાના નામે જ ઉમેરી શકાય — બીજા વિદ્યાર્થીના નામે નહીં.
    createRule: '@request.auth.id != "" && user = @request.auth.id',

    // ઉમેર્યા પછી બદલી શકાતું નથી (ગુણ સાથે છેડછાડ ન થાય).
    updateRule: null,

    // પોતાની માહિતી ભૂંસવાનો હક વિદ્યાર્થી પાસે રહે.
    deleteRule: 'user = @request.auth.id',

    fields: [
      {
        type: "relation", name: "user", required: true,
        collectionId: usersId, cascadeDelete: true, maxSelect: 1
      },
      // ફોન પર બનેલી ઓળખ — બમણું ન સંગ્રહાય તે માટે
      { type: "text", name: "cid", required: true, max: 60 },

      { type: "text", name: "course", required: true, max: 40, presentable: true },
      { type: "text", name: "category", max: 60 },
      // પ્રશ્નની ઓળખ જ — પ્રશ્નનું લખાણ નહીં
      { type: "text", name: "question", max: 60 },
      { type: "select", name: "mode", maxSelect: 1, values: ["interview", "technical"] },

      { type: "number", name: "overall", required: true, min: 0, max: 10 },

      // છ માપદંડ — અલગ ખાનાં રાખ્યાં છે, જેથી admin UI માં જ ક્રમમાં
      // ગોઠવી શકાય અને SQL માં સરેરાશ કાઢી શકાય
      { type: "number", name: "communication", min: 0, max: 10 },
      { type: "number", name: "sentences", min: 0, max: 10 },
      { type: "number", name: "thought", min: 0, max: 10 },
      { type: "number", name: "speech_grammar", min: 0, max: 10 },
      { type: "number", name: "accuracy", min: 0, max: 10 },
      { type: "number", name: "coherence", min: 0, max: 10 },

      { type: "number", name: "words", onlyInt: true, min: 0 },
      { type: "number", name: "coverage", onlyInt: true, min: 0, max: 100 },
      // આ જવાબ પર ગયેલી સેકન્ડ — ડૅશબોર્ડનો «કેટલો સમય પ્રેક્ટિસ» આના પરથી
      { type: "number", name: "secs", onlyInt: true, min: 0, max: 600 },

      // ચૂકેલા ફરજિયાત સલામતીના મુદ્દા (ફક્ત ચાવીઓ)
      { type: "json", name: "missed", maxSize: 2000 },

      // ફોનની ઘડિયાળ પ્રમાણે — ઓફલાઇન જવાબનો ખરો સમય આ છે
      { type: "date", name: "answered_at", required: true },
      // સર્વરની ઘડિયાળ પ્રમાણે — ક્યારે પહોંચ્યું
      { type: "autodate", name: "created", onCreate: true, onUpdate: false }
    ],

    indexes: [
      // એક જ જવાબ બે વાર ન સંગ્રહાય — ઓફલાઇન કતાર માટે આ સૌથી અગત્યનું
      "CREATE UNIQUE INDEX `idx_progress_user_cid` ON `progress` (`user`, `cid`)",
      // ડૅશબોર્ડની સામાન્ય પૂછપરછ ઝડપી રહે
      "CREATE INDEX `idx_progress_user_time` ON `progress` (`user`, `answered_at`)",
      "CREATE INDEX `idx_progress_course` ON `progress` (`course`)"
    ]
  });
  app.save(progress);

  /* ---------- users — થોડાં ખાનાં અને નિયમ ઉમેરીએ ---------- */
  const users = app.findCollectionByNameOrId("users");

  // instructor આખા વર્ગનાં નામ જોઈ શકે; વિદ્યાર્થી ફક્ત પોતાનું.
  users.listRule = 'id = @request.auth.id || @request.auth.id ?= @collection.instructors.user';
  users.viewRule = 'id = @request.auth.id || @request.auth.id ?= @collection.instructors.user';
  users.updateRule = 'id = @request.auth.id';
  users.deleteRule = 'id = @request.auth.id';

  users.fields.add(new Field({
    type: "relation", name: "batch",
    collectionId: batches.id, cascadeDelete: false, maxSelect: 1
  }));
  users.fields.add(new Field({ type: "text", name: "institute", max: 160 }));
  // વિદ્યાર્થીએ પ્રગતિ મોકલવાની સંમતિ ક્યારે આપી. ખાલી હોય તો કંઈ મોકલાતું નથી.
  users.fields.add(new Field({ type: "date", name: "consent_at" }));

  app.save(users);

}, (app) => {

  /* પાછું ફેરવવું — ઉલટા ક્રમમાં, કારણ કે progress અને instructors
     બંને batches/users સાથે જોડાયેલા છે. */

  const users = app.findCollectionByNameOrId("users");
  users.fields.removeByName("batch");
  users.fields.removeByName("institute");
  users.fields.removeByName("consent_at");
  users.listRule = "id = @request.auth.id";
  users.viewRule = "id = @request.auth.id";
  users.updateRule = "id = @request.auth.id";
  users.deleteRule = "id = @request.auth.id";
  app.save(users);

  app.delete(app.findCollectionByNameOrId("progress"));
  app.delete(app.findCollectionByNameOrId("instructors"));
  app.delete(app.findCollectionByNameOrId("batches"));
});
