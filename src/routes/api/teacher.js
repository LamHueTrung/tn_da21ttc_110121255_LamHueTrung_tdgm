const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const CreateTeacher = require("../../app/controllers/command/teacher/CreateTeacher");
const ImportTeachers = require("../../app/controllers/command/teacher/ImportTeachers");
const UpdateTeacher = require("../../app/controllers/command/teacher/UpdateTeacher");
const DeleteTeacher = require("../../app/controllers/command/teacher/DeleteTeacher");
const TeacherQuery = require("../../app/controllers/query/TeacherQuery");

/**
 * @swagger
 * tags:
 *   - name: Teachers
 *     description: API for managing teachers
 */

/**
 * @swagger
 * /teacher/create:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal server error
 */
router.post("/create", upload.none(), (req, res) => {
  CreateTeacher.Handle(req, res);
});

/**
 * @swagger
 * /teacher/import:
 *   post:
 *     summary: Import teachers from CSV file
 *     tags: [Teachers]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Teachers imported successfully
 *       400:
 *         description: Validation or file errors
 *       500:
 *         description: Internal server error
 */
router.post("/import", (req, res) => {
  ImportTeachers.Handle(req, res);
});

/**
 * @swagger
 * /teacher/update/{teacherId}:
 *   put:
 *     summary: Update teacher details by ID
 *     tags: [Teachers]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:teacherId", upload.none(), (req, res) => {
  UpdateTeacher.Handle(req, res);
});

/**
 * @swagger
 * /teacher/delete/{teacherId}:
 *   delete:
 *     summary: Delete a teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
 *       400:
 *         description: Teacher cannot be deleted due to borrow requests
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete/:teacherId", (req, res) => {
  DeleteTeacher.Handle(req, res);
});

/**
 * @swagger
 * /teacher/getAll:
 *   get:
 *     summary: Get a list of all teachers with pagination
 *     tags: [Teachers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of teachers per page
 *     responses:
 *       200:
 *         description: A list of teachers
 *       500:
 *         description: Internal server error
 */
router.get("/getAll", (req, res) => TeacherQuery.GetAllTeachers(req, res));

/**
 * @swagger
 * /teacher/getById/{teacherId}:
 *   get:
 *     summary: Get teacher details by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher details
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.get("/getById/:teacherId", (req, res) => TeacherQuery.GetTeacherById(req, res));

module.exports = router;
