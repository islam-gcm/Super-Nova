const ROLES = Object.freeze({
  LEAD: "lead",
  HR: "hr",
  DEPARTMENT_HEAD: "department_head",
  MEMBER: "member",
});

const PRIVILEGED_ROLES = Object.freeze([ROLES.LEAD, ROLES.HR]);

module.exports = { ROLES, PRIVILEGED_ROLES };
