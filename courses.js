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

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COURSES, COURSE_BY_ID, registerCourse, getCourse };
}
