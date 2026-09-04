/* કોર્સ રજિસ્ટ્રી — દરેક પ્રશ્ન-બેંક પોતાને આ રીતે નોંધાવે છે.
   દરેક bank-*.js ફાઇલ registerCourse() બોલાવે છે.

   def = {
     id      : ટૂંકું અંગ્રેજી નામ (localStorage કી માટે)
     name    : ગુજરાતીમાં કોર્સનું નામ
     icon    : એક ઇમોજી
     tagline : ગુજરાતીમાં એક લીટીની ઓળખ
     mode    : "interview" (HR પ્રશ્નો) અથવા "technical" (તકનીકી પ્રશ્નો)
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
