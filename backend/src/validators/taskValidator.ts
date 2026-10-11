import { body, param } from "express-validator";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "low", "medium", "high"];
const STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED", "todo", "in_progress", "completed"];

/* CREATE */

export const createTaskValidator = [
  body().custom((value, { req }) => {
    if (!req.body.title && !req.body.name) {
      throw new Error("Title or name is required");
    }
    return true;
  }),
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 1, max: 200 })
    .withMessage("Name must be between 1 and 200 characters"),
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 2000 })
    .withMessage("Description must not exceed 2000 characters"),
  body("priority")
    .optional()
    .custom((val) => PRIORITIES.includes(val.toString()))
    .withMessage(`Priority must be one of: LOW, MEDIUM, HIGH`),
  body("status")
    .optional()
    .custom((val) => STATUSES.includes(val.toString()))
    .withMessage(`Status must be one of: TODO, IN_PROGRESS, COMPLETED`),
  body("category")
    .optional({ nullable: true })
    .isString()
    .withMessage("Category must be a string")
    .isLength({ max: 50 })
    .withMessage("Category must not exceed 50 characters"),
  body("dueDate")
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === "" || val === undefined) return true;
      const parsed = Date.parse(val);
      return !isNaN(parsed);
    })
    .withMessage("Due date must be a valid date format")
];

/* UPDATE */

export const updateTaskValidator = [
  param("id").isNumeric().withMessage("Task ID must be a number"),
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 1, max: 200 })
    .withMessage("Name must be between 1 and 200 characters"),
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 2000 })
    .withMessage("Description must not exceed 2000 characters"),
  body("priority")
    .optional()
    .custom((val) => PRIORITIES.includes(val.toString()))
    .withMessage(`Priority must be one of: LOW, MEDIUM, HIGH`),
  body("status")
    .optional()
    .custom((val) => STATUSES.includes(val.toString()))
    .withMessage(`Status must be one of: TODO, IN_PROGRESS, COMPLETED`),
  body("category")
    .optional({ nullable: true })
    .isString()
    .withMessage("Category must be a string")
    .isLength({ max: 50 })
    .withMessage("Category must not exceed 50 characters"),
  body("done").optional().isBoolean().withMessage("Done must be a boolean"),
  body("dueDate")
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === "" || val === undefined) return true;
      const parsed = Date.parse(val);
      return !isNaN(parsed);
    })
    .withMessage("Due date must be a valid date format")
];

/* ID PARAM */

export const taskIdValidator = [
  param("id").isNumeric().withMessage("Task ID must be a number")
];
