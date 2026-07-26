export function validateAuthInput({ email, password, mode = "signin", name = "" }) {
  if (!email || !password) return "Email and password are required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (mode === "signup" && !name.trim()) return "Please enter your name.";
  return null;
}

export function normalizeSkill(value) {
  return value.trim().toLowerCase();
}

export function addSkill(skills, value, max = 5) {
  const skill = normalizeSkill(value);
  if (!skill || skills.length >= max || skills.includes(skill)) return skills;
  return [...skills, skill];
}

export function removeSkill(skills, skill) {
  return skills.filter((item) => item !== skill);
}

export function validateProfile({ name, cost }) {
  if (!name.trim()) return { error: "Name cannot be empty." };
  const costNum = Number.parseInt(cost, 10);
  if (Number.isNaN(costNum) || costNum < 0 || costNum > 500) {
    return { error: "Cost per session must be a number between 0 and 500." };
  }
  return { value: { name: name.trim(), cost: costNum } };
}

export function parsePreferredTime(value) {
  if (!value.trim()) return null;
  const parsed = new Date(value.trim().replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? "invalid" : parsed.toISOString();
}

export function filterTeachers(teachers, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return teachers;
  return teachers.filter((teacher) =>
    (teacher.name || "").toLowerCase().includes(normalized) ||
    (teacher.teach_skills || []).some((skill) => skill.toLowerCase().includes(normalized))
  );
}

export function calculateWalletTotals(transactions) {
  return transactions.reduce(
    (totals, transaction) => ({
      earned: totals.earned + (transaction.type === "earning" ? transaction.amount : 0),
      spent: totals.spent + (transaction.amount < 0 ? Math.abs(transaction.amount) : 0),
    }),
    { earned: 0, spent: 0 }
  );
}

export const transactionLabels = {
  welcome: "Welcome bonus",
  escrow_hold: "Held in escrow",
  refund: "Refund",
  earning: "Teaching payout",
};

export function transactionLabel(type) {
  return transactionLabels[type] || type;
}

export function filterSessions(sessions, status) {
  return sessions.filter((session) => session.status === status);
}

export function sessionCounts(sessions) {
  return ["pending", "accepted", "completed", "declined"].reduce(
    (counts, status) => ({ ...counts, [status]: filterSessions(sessions, status).length }),
    {}
  );
}

export function getSessionRole(session, userId) {
  return session.teacher_id === userId ? "teacher" : "learner";
}

export function otherParticipantId(session, userId) {
  return getSessionRole(session, userId) === "teacher" ? session.learner_id : session.teacher_id;
}

export function confirmationStatus(session, userId) {
  const teacher = getSessionRole(session, userId) === "teacher";
  return {
    mine: teacher ? Boolean(session.teacher_confirmed) : Boolean(session.learner_confirmed),
    theirs: teacher ? Boolean(session.learner_confirmed) : Boolean(session.teacher_confirmed),
  };
}

export function sessionCoinDirection(session, userId) {
  return getSessionRole(session, userId) === "teacher" ? 1 : -1;
}