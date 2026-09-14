/// <reference path="../pb_data/types.d.ts" />

/* Interview Prep - the backend schema.

   This is a PocketBase migration. Drop it in `pb_migrations/` and start the
   server; it applies itself. Nothing needs creating by hand in the admin UI.

   Three design points worth understanding before changing anything:

   1. The text of a student's answer never reaches the server. Only scores,
      criteria and timings do. `progress` has no field for an answer at all - so
      even if one were sent by mistake, it could not be stored.

   2. Who can see everything is decided by a separate `instructors` collection,
      not by a role on `users`. Why: PocketBase has no field-level rules. With a
      role on users, a student could update their own record to make themselves
      an instructor and read the whole class's data. No API rule on `instructors`
      is open (all null), so only a superuser can make someone an instructor,
      from the admin UI.

   3. `progress` is append-only - its update rule is null. Every record carries a
      `cid` (client id) and there is a unique index on (user, cid). So a phone
      that queues an answer while offline and re-sends it never stores it twice.
*/

migrate((app) => {

  const usersId = app.findCollectionByNameOrId("users").id;

  /* ---------- batches - classes / cohorts ---------- */
  const batches = new Collection({
    name: "batches",
    type: "base",
    // Any signed-in student can read a batch name; creating and editing is
    // superuser only (a null rule means admin UI / superuser token only).
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

  /* ---------- instructors - who can see the whole class ---------- */
  const instructors = new Collection({
    name: "instructors",
    type: "base",
    // All rules null: only a superuser can change this list. Other collections'
    // rules read @collection.instructors internally - that join happens on the
    // server and is not bound by these rules.
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
        // Empty means every batch is visible; filled means only those batches.
        // (Not used in any rule - the dashboard filters on it.)
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

  /* ---------- progress - the score and timing of one answer ---------- */
  const progress = new Collection({
    name: "progress",
    type: "base",

    // A student sees their own records; an instructor sees all of them.
    listRule: 'user = @request.auth.id || @request.auth.id ?= @collection.instructors.user',
    viewRule: 'user = @request.auth.id || @request.auth.id ?= @collection.instructors.user',

    // You can only add records under your own name, never another student's.
    createRule: '@request.auth.id != "" && user = @request.auth.id',

    // Immutable once added, so scores cannot be tampered with.
    updateRule: null,

    // A student keeps the right to erase their own data.
    deleteRule: 'user = @request.auth.id',

    fields: [
      {
        type: "relation", name: "user", required: true,
        collectionId: usersId, cascadeDelete: true, maxSelect: 1
      },
      // An id generated on the phone - what stops duplicate storage
      { type: "text", name: "cid", required: true, max: 60 },

      { type: "text", name: "course", required: true, max: 40, presentable: true },
      { type: "text", name: "category", max: 60 },
      // The question's id only - never the question text
      { type: "text", name: "question", max: 60 },
      { type: "select", name: "mode", maxSelect: 1, values: ["interview", "technical"] },

      { type: "number", name: "overall", required: true, min: 0, max: 10 },

      // Six criteria, kept as separate columns so they can be sorted in the
      // admin UI and averaged in SQL
      { type: "number", name: "communication", min: 0, max: 10 },
      { type: "number", name: "sentences", min: 0, max: 10 },
      { type: "number", name: "thought", min: 0, max: 10 },
      { type: "number", name: "speech_grammar", min: 0, max: 10 },
      { type: "number", name: "accuracy", min: 0, max: 10 },
      { type: "number", name: "coherence", min: 0, max: 10 },

      { type: "number", name: "words", onlyInt: true, min: 0 },
      { type: "number", name: "coverage", onlyInt: true, min: 0, max: 100 },
      // Seconds spent on this answer - the dashboard's "time practised" comes from this
      { type: "number", name: "secs", onlyInt: true, min: 0, max: 600 },

      // Mandatory safety points that were missed (keys only)
      { type: "json", name: "missed", maxSize: 2000 },

      // By the phone's clock - the true time of an answer given offline
      { type: "date", name: "answered_at", required: true },
      // By the server's clock - when it arrived
      { type: "autodate", name: "created", onCreate: true, onUpdate: false }
    ],

    indexes: [
      // Stops one answer being stored twice - the key guarantee for the offline queue
      "CREATE UNIQUE INDEX `idx_progress_user_cid` ON `progress` (`user`, `cid`)",
      // Keeps the dashboard's common queries fast
      "CREATE INDEX `idx_progress_user_time` ON `progress` (`user`, `answered_at`)",
      "CREATE INDEX `idx_progress_course` ON `progress` (`course`)"
    ]
  });
  app.save(progress);

  /* ---------- users - add a few fields and rules ---------- */
  const users = app.findCollectionByNameOrId("users");

  // An instructor sees the whole class's names; a student sees only their own.
  users.listRule = 'id = @request.auth.id || @request.auth.id ?= @collection.instructors.user';
  users.viewRule = 'id = @request.auth.id || @request.auth.id ?= @collection.instructors.user';
  users.updateRule = 'id = @request.auth.id';
  users.deleteRule = 'id = @request.auth.id';

  users.fields.add(new Field({
    type: "relation", name: "batch",
    collectionId: batches.id, cascadeDelete: false, maxSelect: 1
  }));
  users.fields.add(new Field({ type: "text", name: "institute", max: 160 }));
  // When the student consented to sending progress. Empty means nothing is sent.
  users.fields.add(new Field({ type: "date", name: "consent_at" }));

  app.save(users);

}, (app) => {

  /* Rolling back - in reverse order, because progress and instructors are both
     linked to batches/users. */

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
