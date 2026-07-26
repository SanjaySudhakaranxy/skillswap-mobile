import {
  addSkill,
  calculateWalletTotals,
  confirmationStatus,
  filterSessions,
  filterTeachers,
  getSessionRole,
  normalizeSkill,
  otherParticipantId,
  parsePreferredTime,
  removeSkill,
  sessionCoinDirection,
  sessionCounts,
  transactionLabel,
  validateAuthInput,
  validateProfile,
} from "../../src/lib/appLogic";

const teachers = [
  { id: "a", name: "Asha", teach_skills: ["react", "sql"] },
  { id: "b", name: "Ben", teach_skills: ["guitar"] },
];
const sessions = [
  { id: "1", status: "pending", teacher_id: "t", learner_id: "l", teacher_confirmed: false, learner_confirmed: false },
  { id: "2", status: "accepted", teacher_id: "t", learner_id: "l", teacher_confirmed: true, learner_confirmed: false },
  { id: "3", status: "completed", teacher_id: "t", learner_id: "l", teacher_confirmed: true, learner_confirmed: true },
  { id: "4", status: "declined", teacher_id: "t", learner_id: "l", teacher_confirmed: false, learner_confirmed: false },
];

describe("SkillSwap business rules", () => {
  test("01 rejects empty email", () => expect(validateAuthInput({ email: "", password: "secret" })).toBe("Email and password are required."));
  test("02 rejects empty password", () => expect(validateAuthInput({ email: "a@b.com", password: "" })).toBe("Email and password are required."));
  test("03 rejects short password", () => expect(validateAuthInput({ email: "a@b.com", password: "12345" })).toBe("Password must be at least 6 characters."));
  test("04 accepts valid sign in", () => expect(validateAuthInput({ email: "a@b.com", password: "123456" })).toBeNull());
  test("05 signup requires a name", () => expect(validateAuthInput({ email: "a@b.com", password: "123456", mode: "signup" })).toBe("Please enter your name."));
  test("06 accepts named signup", () => expect(validateAuthInput({ email: "a@b.com", password: "123456", mode: "signup", name: "Asha" })).toBeNull());
  test("07 normalizes skill casing", () => expect(normalizeSkill(" React ")).toBe("react"));
  test("08 adds a valid skill", () => expect(addSkill(["sql"], "React")).toEqual(["sql", "react"]));
  test("09 ignores empty skills", () => expect(addSkill(["sql"], " ")).toEqual(["sql"]));
  test("10 blocks duplicate skills", () => expect(addSkill(["sql"], "SQL")).toEqual(["sql"]));
  test("11 respects skill maximum", () => expect(addSkill(["a", "b"], "c", 2)).toEqual(["a", "b"]));
  test("12 removes a skill", () => expect(removeSkill(["react", "sql"], "react")).toEqual(["sql"]));
  test("13 keeps skills when removing missing value", () => expect(removeSkill(["react"], "sql")).toEqual(["react"]));
  test("14 profile requires a name", () => expect(validateProfile({ name: " ", cost: "10" }).error).toBe("Name cannot be empty."));
  test("15 profile rejects non-numeric cost", () => expect(validateProfile({ name: "Asha", cost: "none" }).error).toContain("Cost per session"));
  test("16 profile rejects negative cost", () => expect(validateProfile({ name: "Asha", cost: "-1" }).error).toContain("Cost per session"));
  test("17 profile rejects excessive cost", () => expect(validateProfile({ name: "Asha", cost: "501" }).error).toContain("Cost per session"));
  test("18 profile accepts free session", () => expect(validateProfile({ name: "Asha", cost: "0" }).value.cost).toBe(0));
  test("19 profile trims the name", () => expect(validateProfile({ name: " Asha ", cost: "20" }).value.name).toBe("Asha"));
  test("20 empty preferred time is optional", () => expect(parsePreferredTime(" ")).toBeNull());
  test("21 invalid preferred time is rejected", () => expect(parsePreferredTime("not-a-date")).toBe("invalid"));
  test("22 valid preferred time becomes ISO", () => expect(parsePreferredTime("2026-08-01 18:30")).toMatch(/^2026-08-01T/));
  test("23 teacher search returns all for blank query", () => expect(filterTeachers(teachers, " ")).toHaveLength(2));
  test("24 teacher search finds name", () => expect(filterTeachers(teachers, "asha").map((t) => t.id)).toEqual(["a"]));
  test("25 teacher search ignores name case", () => expect(filterTeachers(teachers, "BEN").map((t) => t.id)).toEqual(["b"]));
  test("26 teacher search finds skill", () => expect(filterTeachers(teachers, "sql").map((t) => t.id)).toEqual(["a"]));
  test("27 teacher search supports partial skills", () => expect(filterTeachers(teachers, "guit").map((t) => t.id)).toEqual(["b"]));
  test("28 teacher search returns no unmatched results", () => expect(filterTeachers(teachers, "python")).toEqual([]));
  test("29 wallet totals start at zero", () => expect(calculateWalletTotals([])).toEqual({ earned: 0, spent: 0 }));
  test("30 wallet tracks teaching earnings", () => expect(calculateWalletTotals([{ type: "earning", amount: 25 }]).earned).toBe(25));
  test("31 wallet tracks learning spend", () => expect(calculateWalletTotals([{ type: "escrow_hold", amount: -20 }]).spent).toBe(20));
  test("32 wallet ignores positive non-earnings", () => expect(calculateWalletTotals([{ type: "welcome", amount: 100 }]).earned).toBe(0));
  test("33 wallet aggregates mixed transactions", () => expect(calculateWalletTotals([{ type: "earning", amount: 10 }, { type: "escrow_hold", amount: -4 }])).toEqual({ earned: 10, spent: 4 }));
  test("34 labels welcome transactions", () => expect(transactionLabel("welcome")).toBe("Welcome bonus"));
  test("35 labels teaching earnings", () => expect(transactionLabel("earning")).toBe("Teaching payout"));
  test("36 preserves unknown transaction label", () => expect(transactionLabel("adjustment")).toBe("adjustment"));
  test("37 filters pending sessions", () => expect(filterSessions(sessions, "pending")).toHaveLength(1));
  test("38 filters accepted sessions", () => expect(filterSessions(sessions, "accepted")).toHaveLength(1));
  test("39 counts every session status", () => expect(sessionCounts(sessions)).toEqual({ pending: 1, accepted: 1, completed: 1, declined: 1 }));
  test("40 identifies teacher role", () => expect(getSessionRole(sessions[0], "t")).toBe("teacher"));
  test("41 identifies learner role", () => expect(getSessionRole(sessions[0], "l")).toBe("learner"));
  test("42 finds learner as teacher's counterpart", () => expect(otherParticipantId(sessions[0], "t")).toBe("l"));
  test("43 finds teacher as learner's counterpart", () => expect(otherParticipantId(sessions[0], "l")).toBe("t"));
  test("44 reports confirmation state by viewer", () => expect(confirmationStatus(sessions[1], "l")).toEqual({ mine: false, theirs: true }));
  test("45 assigns session coin direction", () => expect([sessionCoinDirection(sessions[0], "t"), sessionCoinDirection(sessions[0], "l")]).toEqual([1, -1]));
});