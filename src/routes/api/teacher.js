const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const CreateTeacher = require("../../app/controllers/command/teacher/CreateTeacher");
const ImportTeachers = require("../../app/controllers/command/teacher/ImportTeachers");
const UpdateTeacher = require("../../app/controllers/command/teacher/UpdateTeacher");
const DeleteTeacher = require("../../app/controllers/command/teacher/DeleteTeacher");
const TeacherQuery = require("../../app/controllers/query/TeacherQuery");

// API thêm giảng viên bằng trình duyệt
router.post("/create", upload.none(), (req, res) => {
    CreateTeacher.Handle(req, res);
});

// API thêm giảng viên từ file CSV
router.post("/import", (req, res) => {
    ImportTeachers.Handle(req, res);
});

// API cập nhật giảng viên
router.put("/update/:teacherId", upload.none(), (req, res) => {
    UpdateTeacher.Handle(req, res);
});

// API xóa giảng viên
router.delete("/delete/:teacherId", (req, res) => {
    DeleteTeacher.Handle(req, res);
});

// Lấy danh sách tất cả giảng viên (có phân trang và lọc theo bộ môn)
router.get("/getAll", (req, res) => TeacherQuery.GetAllTeachers(req, res));

// Lấy thông tin giảng viên theo ID
router.get("/getById/:teacherId", (req, res) => TeacherQuery.GetTeacherById(req, res));

module.exports = router;
