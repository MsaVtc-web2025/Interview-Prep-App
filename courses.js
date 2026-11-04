/* Course registry — this is how each question bank registers itself.
   Every bank-*.js file calls registerCourse().

   def = {
     id      : short English name (used as the localStorage key)
     name    : course name in Gujarati
     icon    : a single emoji
     tagline : one-line description in Gujarati
     mode    : "interview" (HR questions) or "technical" (trade questions)
     questions: [ ... ]
   }
*/
"use strict";

const COURSES = [];
const COURSE_BY_ID = Object.create(null);

function registerCourse(def) {
  if (!def || !def.id || !Array.isArray(def.questions)) return;
  def.mode = def.mode === "technical" ? "technical" : "interview";
  COURSES.push(def);
  COURSE_BY_ID[def.id] = def;
}

function getCourse(id) { return COURSE_BY_ID[id] || null; }

/* Chapter Quiz banks - the trade's own course book, one entry per chapter.
   Every chapters-*.js file calls registerChapters() with the id of the course
   it belongs to. A trade with no chapters file shows "Coming soon".

   chapter = {
     id    : short id, unique inside the course (used as the localStorage key)
     no    : chapter number as printed in the book ("1.0", "7.11", "3")
     title : chapter name, as in the book
     qs    : [ { q: question, a: book answer, t: topic (optional) } ]
   }
*/
const CHAPTERS = Object.create(null);

/* ---------------- Long chapters become parts ----------------

   Some chapters of the CNC book run to 125, 150, 160 questions. Sat in one go
   that is an hour of quiz with no place to stop, and the score at the end says
   nothing about which half of it the student actually knows.

   Those chapters are built out of the book's own named sections, and the
   sections are the same size (2.1 Basic Linear Measurement, 2.2 Steel Rule...,
   25 each). So a part is one section: equal lengths, and a name that tells the
   student what they are about to be asked rather than "Part 3".

   A chapter is only split where every section is a quiz worth sitting on its
   own. The nursing book also marks sections, but short and uneven ones - its
   chapter 11 runs 7, 6, 4, 2, 9, 5 - and a "Part 4" of two questions is not a
   quiz. Those chapters are left whole; at 29 to 37 questions they are sittable
   in one go anyway. */

const PART_MAX = 25;          // longer than this and we look for sections
const PART_MIN = 10;          // every section must hold at least this many

/* The section a question belongs to, in the book's own language */
function sectionOf(q) {
  if (!q || !q.t) return null;
  return typeof q.t === "object" ? (q.t.gu || q.t.en || q.t.hi || null) : q.t;
}

function splitChapter(ch) {
  if (ch.qs.length <= PART_MAX) return [ch];

  // Consecutive questions sharing a section name
  const groups = [];
  ch.qs.forEach((q, i) => {
    const sec = sectionOf(q);
    const last = groups[groups.length - 1];
    if (!last || last.sec !== sec) groups.push({ sec: sec, from: i, qs: [q] });
    else last.qs.push(q);
  });
  /* Leave the chapter whole unless the book's sections genuinely divide it:
     at least two of them, every question inside one, and none so short that
     it would make a quiz not worth opening. */
  if (groups.length < 2) return [ch];
  if (groups.some(g => !g.sec || g.qs.length < PART_MIN)) return [ch];

  return groups.map((g, n) => {
    const t0 = g.qs[0].t;
    return {
      id: ch.id + "-p" + (n + 1),
      no: ch.no + "." + (n + 1),
      // The section's name is the part's name; quiz.js prefixes "Part n"
      title: g.sec,
      titles: (t0 && typeof t0 === "object") ? { en: t0.en, hi: t0.hi } : null,
      qs: g.qs,
      /* srcId and from point back at the chapter the book had. The written
         multiple-choice options in mcq-*.js are keyed by that chapter and by
         the question's index inside it, so a part has to be able to find them. */
      part: { n: n + 1, of: groups.length, srcId: ch.id, from: g.from }
    };
  });
}

function registerChapters(courseId, list) {
  if (!courseId || !Array.isArray(list)) return;
  CHAPTERS[courseId] = list
    .filter(c => c && c.id && Array.isArray(c.qs) && c.qs.length)
    .reduce((out, ch) => out.concat(splitChapter(ch)), []);
}

function getChapters(courseId) { return CHAPTERS[courseId] || []; }

/* Multiple-choice wrong options, written for each book question - the
   mcq-*.js files. { chapterId: [ { gu: [3], en: [3], hi: [3] } per question,
   in the chapter's question order ] }. A question with none falls back to
   answers of other questions (quiz.js choices()). */
const MCQ = Object.create(null);

function registerMcq(courseId, byChapter) {
  if (courseId && byChapter && typeof byChapter === "object") MCQ[courseId] = byChapter;
}

function getMcq(courseId, chId, i) {
  const ch = MCQ[courseId] && MCQ[courseId][chId];
  return (ch && ch[i]) || null;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COURSES, COURSE_BY_ID, registerCourse, getCourse, CHAPTERS, registerChapters, getChapters, MCQ, registerMcq, getMcq };
}
