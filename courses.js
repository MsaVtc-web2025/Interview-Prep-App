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

function registerChapters(courseId, list) {
  if (!courseId || !Array.isArray(list)) return;
  CHAPTERS[courseId] = list.filter(c => c && c.id && Array.isArray(c.qs) && c.qs.length);
}

function getChapters(courseId) { return CHAPTERS[courseId] || []; }

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COURSES, COURSE_BY_ID, registerCourse, getCourse, CHAPTERS, registerChapters, getChapters };
}
