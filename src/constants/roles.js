// 👥 User Roles and Permissions
// User roles based on the API documentation

export const USER_ROLES = {
  GUEST: "guest",
  MEMBER: "member",
  STAFF: "staff",
  CONSULTANT: "consultant",
  MANAGER: "manager",
  ADMIN: "admin",
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.GUEST]: {
    canViewCourses: true,
    canViewBlogs: true,
    canEnrollCourses: false,
    canTakeSurveys: false,
    canBookAppointments: false,
    canCreateContent: false,
  },

  [USER_ROLES.MEMBER]: {
    canViewCourses: true,
    canViewBlogs: true,
    canEnrollCourses: true,
    canTakeSurveys: true,
    canBookAppointments: true,
    canReviewCourses: true,
    canCreateContent: false,
  },

  [USER_ROLES.STAFF]: {
    canViewCourses: true,
    canViewBlogs: true,
    canEnrollCourses: true,
    canTakeSurveys: true,
    canBookAppointments: true,
    canReviewCourses: true,
    canCreateContent: false,
  },

  [USER_ROLES.CONSULTANT]: {
    canViewCourses: true,
    canViewBlogs: true,
    canEnrollCourses: true,
    canTakeSurveys: true,
    canBookAppointments: false, // Consultants provide appointments
    canReviewCourses: true,
    canCreateContent: true,
    canCreateBlogs: true,
    canManageAppointments: true,
  },

  [USER_ROLES.MANAGER]: {
    canViewCourses: true,
    canViewBlogs: true,
    canEnrollCourses: true,
    canTakeSurveys: true,
    canBookAppointments: true,
    canReviewCourses: true,
    canCreateContent: true,
    canCreateCourses: true,
    canManageCourses: true,
  },

  [USER_ROLES.ADMIN]: {
    canViewCourses: true,
    canViewBlogs: true,
    canEnrollCourses: true,
    canTakeSurveys: true,
    canBookAppointments: true,
    canReviewCourses: true,
    canCreateContent: true,
    canCreateCourses: true,
    canManageCourses: true,
    canManageUsers: true,
    canDeleteUsers: true,
    canViewAllData: true,
  },
};

export const TARGET_AUDIENCES = {
  STUDENT: "student",
  UNIVERSITY_STUDENT: "university_student",
  PARENT: "parent",
  TEACHER: "teacher",
};
