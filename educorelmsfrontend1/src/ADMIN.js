import React, { useState, useEffect, useMemo } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Nav,
    Table,
    Button,
    Form,
    InputGroup,
    Alert,
    Spinner,
    Modal,
    Toast,
    Pagination,
    Badge
} from "react-bootstrap";
import axios from "axios";

const PAGE_SIZE = 8;

const SummaryCard = ({ title, value, subtitle, bg, icon }) => (
    <Card className="text-white mb-3 shadow-sm" style={{ background: bg, border: "none", borderRadius: 12 }}>
        <Card.Body className="d-flex align-items-center">
            <div style={{ fontSize: 28, lineHeight: 1 }} className="me-3">{icon}</div>
            <div className="flex-grow-1">
                <div className="small text-uppercase opacity-75">{title}</div>
                <div className="h4 mb-1 fw-bold">{value}</div>
                <div className="small opacity-75">{subtitle}</div>
            </div>
        </Card.Body>
    </Card>
);

const Sidebar = ({ activeTab, setActiveTab }) => (
    <div className="sidebar p-3 d-flex flex-column" style={{ minHeight: "85vh", background: "linear-gradient(180deg,#f7f9ff,#f1f3ff)", borderRight: "1px solid rgba(107,70,193,0.08)" }}>
        <div className="mb-4 d-flex align-items-center">
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(90deg,#6f42c1,#7b5cf6)" }} className="me-2 shadow-sm" />
            <div>
                <div className="fw-bold" style={{ color: "#6f42c1" }}>EDUCORE</div>
                <div className="small text-muted">Administrator</div>
            </div>
        </div>

        <Nav className="flex-column" variant="pills" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
            <Nav.Item><Nav.Link eventKey="dashboard" className="d-flex align-items-center"><span className="me-2">🏠</span> Dashboard</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="lecturers" className="d-flex align-items-center"><span className="me-2">👩‍🏫</span> Lecturers</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="students" className="d-flex align-items-center"><span className="me-2">🎓</span> Students</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="courses" className="d-flex align-items-center"><span className="me-2">📚</span> Courses</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="modules" className="d-flex align-items-center"><span className="me-2">📦</span> Modules</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="assign" className="d-flex align-items-center"><span className="me-2">🔗</span> Assignments</Nav.Link></Nav.Item>
        </Nav>

        <div className="mt-auto">
            <hr />
            <Button variant="outline-danger" size="sm" className="w-100" onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }}>
                Logout
            </Button>
        </div>
    </div>
);

const ADMIN = () => {
    // existing state (lecturers/students) + new state for courses/modules/assignments
    const [activeTab, setActiveTab] = useState("lecturers");
    const [lecturers, setLecturers] = useState([
        { lecturerId: 'l1', staffNumber: 'LEC-001', name: 'Dr. Sipho', surname: 'Nkosi', emailAddress: 'sipho@educore.edu' },
        { lecturerId: 'l2', staffNumber: 'LEC-002', name: 'Prof. Aisha', surname: 'Khan', emailAddress: 'aisha@educore.edu' }
    ]);

    const [students, setStudents] = useState([
        { studentId: "s1", studentNumber: "STU-001", name: "Alice", surname: "Mokgadi", dateOfBirth: "2000-05-12", homeAddress: "12 Main St", phoneNumber: "0710000001", emailAddress: "alice@example.com" },
        { studentId: "s2", studentNumber: "STU-002", name: "Brian", surname: "Thabo", dateOfBirth: "1999-09-23", homeAddress: "34 Oak Rd", phoneNumber: "0710000002", emailAddress: "brian@example.com" },
        { studentId: "s3", studentNumber: "STU-003", name: "Chloe", surname: "Naidoo", dateOfBirth: "2001-02-02", homeAddress: "56 Pine Ave", phoneNumber: "0710000003", emailAddress: "chloe@example.com" },
        { studentId: "s4", studentNumber: "STU-004", name: "Daniel", surname: "Masuku", dateOfBirth: "2000-11-11", homeAddress: "78 Birch Ln", phoneNumber: "0710000004", emailAddress: "daniel@example.com" },
        { studentId: "s5", studentNumber: "STU-005", name: "Elena", surname: "Sibiya", dateOfBirth: "1998-07-30", homeAddress: "90 Cedar St", phoneNumber: "0710000005", emailAddress: "elena@example.com" },
        { studentId: "s6", studentNumber: "STU-006", name: "Faisal", surname: "Patel", dateOfBirth: "2002-03-18", homeAddress: "21 Maple Rd", phoneNumber: "0710000006", emailAddress: "faisal@example.com" }
    ]);

    // sample courses so the Courses table shows data
    const [courses, setCourses] = useState([
        { courseId: 'c1', name: 'Computer Science', code: 'CS101', lecturerId: 'l1', students: ['s1','s3'] },
        { courseId: 'c2', name: 'Information Systems', code: 'IS201', lecturerId: 'l2', students: ['s2','s4','s5'] },
        { courseId: 'c3', name: 'Mathematics', code: 'MATH150', lecturerId: null, students: ['s6'] }
    ]);

    // modulesByCourse: { [courseId]: [module, ...] }
    const [modulesByCourse, setModulesByCourse] = useState({
        c1: [
            { moduleId: 'm1', name: 'Intro to Programming', code: 'CS101-A' },
            { moduleId: 'm2', name: 'Data Structures', code: 'CS101-B' }
        ],
        c2: [
            { moduleId: 'm3', name: 'Systems Analysis', code: 'IS201-A' },
            { moduleId: 'm4', name: 'Database Design', code: 'IS201-B' }
        ],
        c3: [
            { moduleId: 'm5', name: 'Calculus I', code: 'MATH150-A' }
        ]
    });
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState({ students: false, lecturers: false, courses: false, modules: false });
    const [error, setError] = useState("");

    // Modal / form state (expanded)
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // 'add' | 'edit'
    const [modalEntity, setModalEntity] = useState("lecturer"); // 'lecturer' | 'student' | 'course' | 'module' | 'assign'
    const [form, setForm] = useState({
        staffNumber: "", studentNumber: "", name: "", surname: "", dateOfBirth: "", homeAddress: "", phoneNumber: "",
        // course/module fields:
        courseName: "", courseCode: "", moduleName: "", moduleCode: "", moduleId: null, courseId: null,
        // assign fields:
        assignCourseId: "", assignLecturerId: "", assignStudentId: ""
    });

    const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
    const [page, setPage] = useState(1);
    const [sortAsc, setSortAsc] = useState(true);

    // --- lifecycle: load initial data ---
    useEffect(() => {
        getStudentData();
        getLecturerData();
        getCourses();
    }, []);

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // --- API helpers (use fallback local updates on failure) ---
    const getStudentData = async () => {
        try {
            setLoading(prev => ({ ...prev, students: true }));
            setError("");
            // backend: api/Student/ReadingStudents
            const res = await axios.get("https://localhost:7281/api/Student/ReadingStudents");
            setStudents(res.data || []);
        } catch (err) {
            console.error(err);
            // setError("Failed to load students. Using offline state.");
            // keep existing local state
        } finally {
            setLoading(prev => ({ ...prev, students: false }));
        }
    };

    const getLecturerData = async () => {
        try {
            setLoading(prev => ({ ...prev, lecturers: true }));
            setError("");
            const res = await axios.get("https://localhost:7281/api/Lecturer/GetAllLecturers");
            setLecturers(res.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load lecturers. Using offline state.");
        } finally {
            setLoading(prev => ({ ...prev, lecturers: false }));
        }
    };

    const getCourses = async () => {
        try {
            setLoading(prev => ({ ...prev, courses: true }));
            setError("");
            const res = await axios.get("https://localhost:7281/api/Course");
            // only overwrite local courses if backend returns a non-empty array
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setCourses(res.data);
            } else {
                // keep existing (static) courses
                console.info('No courses returned from backend; keeping local sample courses.');
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load courses. Using offline state.");
        } finally {
            setLoading(prev => ({ ...prev, courses: false }));
        }
    };

    const getModulesForCourse = async (courseId) => {
        try {
            setLoading(prev => ({ ...prev, modules: true }));
            setError("");
            const res = await axios.get(`https://localhost:7281/api/Module/GetByCourse/${courseId}`);
            setModulesByCourse(prev => ({ ...prev, [courseId]: res.data || [] }));
            return res.data || [];
        } catch (err) {
            console.error(err);
            setError("Failed to load modules for course.");
            return modulesByCourse[courseId] || [];
        } finally {
            setLoading(prev => ({ ...prev, modules: false }));
        }
    };

    // --- Create / Update / Delete for Lecturer & Student (use existing flows with API placeholders) ---
    const addLecturer = async (payload) => {
        try {
            setLoading(prev => ({ ...prev, lecturers: true }));
            const body = { ...payload, dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth).toISOString() : null };
            const res = await axios.post("https://localhost:7281/api/Lecturer/AddNewLecturer", body);
            const created = res.data || { lecturerId: Date.now(), ...payload };
            setLecturers(prev => [created, ...prev]);
            showToast("Lecturer added", "success");
            return created;
        } catch (err) {
            console.error(err);
            // fallback
            const created = { lecturerId: Date.now(), ...payload };
            setLecturers(prev => [created, ...prev]);
            showToast("Lecturer added (offline)", "info");
            return created;
        } finally {
            setLoading(prev => ({ ...prev, lecturers: false }));
        }
    };

    const updateLecturer = async (id, payload) => {
        try {
            // backend: PUT api/Lecturer/UpdateLecturerByID/{lecturerId}
            await axios.put(`https://localhost:7281/api/Lecturer/UpdateLecturerByID/${id}`, payload);
            setLecturers(prev => prev.map(l => (l.lecturerId === id || l.id === id) ? { ...l, ...payload } : l));
            showToast("Lecturer updated");
        } catch (err) {
            console.error(err);
            setLecturers(prev => prev.map(l => (l.lecturerId === id || l.id === id) ? { ...l, ...payload } : l));
            showToast("Lecturer updated (offline)", "info");
        }
    };

    const deleteLecturer = async (id) => {
        try {
            // backend: DELETE api/Lecturer/DeleteLecturerByID/{lecturerId}
            await axios.delete(`https://localhost:7281/api/Lecturer/DeleteLecturerByID/${id}`);
            setLecturers(prev => prev.filter(l => l.lecturerId !== id && l.id !== id));
            showToast("Lecturer deleted");
        } catch (err) {
            console.error(err);
            setLecturers(prev => prev.filter(l => l.lecturerId !== id && l.id !== id));
            showToast("Lecturer deleted (offline)", "info");
        }
    };

    const addStudent = async (payload) => {
        try {
            setLoading(prev => ({ ...prev, students: true }));
            const res = await axios.post("https://localhost:7281/api/Student", payload);
            const created = res.data || { studentId: Date.now(), ...payload };
            setStudents(prev => [created, ...prev]);
            showToast("Student added", "success");
            return created;
        } catch (err) {
            console.error(err);
            const created = { studentId: Date.now(), ...payload };
            setStudents(prev => [created, ...prev]);
            showToast("Student added (offline)", "info");
            return created;
        } finally {
            setLoading(prev => ({ ...prev, students: false }));
        }
    };

    const updateStudent = async (id, payload) => {
        try {
            await axios.put(`https://localhost:7281/api/Student/${id}`, payload);
            setStudents(prev => prev.map(s => (s.studentId === id || s.id === id) ? { ...s, ...payload } : s));
            showToast("Student updated");
        } catch (err) {
            console.error(err);
            setStudents(prev => prev.map(s => (s.studentId === id || s.id === id) ? { ...s, ...payload } : s));
            showToast("Student updated (offline)", "info");
        }
    };

    const deleteStudent = async (id) => {
        try {
            // backend: DELETE api/Student/DeletingStudents/{id}
            await axios.delete(`https://localhost:7281/api/Student/DeletingStudents/${id}`);
            setStudents(prev => prev.filter(s => s.studentId !== id && s.id !== id));
            showToast("Student deleted");
        } catch (err) {
            console.error(err);
            setStudents(prev => prev.filter(s => s.studentId !== id && s.id !== id));
            showToast("Student deleted (offline)", "info");
        }
    };

    // --- Courses & Modules CRUD ---
    const addCourse = async (payload) => {
        try {
            setLoading(prev => ({ ...prev, courses: true }));
            const res = await axios.post("https://localhost:7281/api/Course", payload);
            const created = res.data || { courseId: Date.now(), ...payload };
            setCourses(prev => [created, ...prev]);
            showToast("Course added", "success");
            return created;
        } catch (err) {
            console.error(err);
            const created = { courseId: Date.now(), ...payload };
            setCourses(prev => [created, ...prev]);
            showToast("Course added (offline)", "info");
            return created;
        } finally {
            setLoading(prev => ({ ...prev, courses: false }));
        }
    };

    const updateCourse = async (id, payload) => {
        try {
            await axios.put(`https://localhost:7281/api/Course/${id}`, payload);
            setCourses(prev => prev.map(c => (c.courseId === id || c.id === id) ? { ...c, ...payload } : c));
            showToast("Course updated");
        } catch (err) {
            console.error(err);
            setCourses(prev => prev.map(c => (c.courseId === id || c.id === id) ? { ...c, ...payload } : c));
            showToast("Course updated (offline)", "info");
        }
    };

    const deleteCourse = async (id) => {
        try {
            await axios.delete(`https://localhost:7281/api/Course/${id}`);
            setCourses(prev => prev.filter(c => c.courseId !== id && c.id !== id));
            // remove modules
            setModulesByCourse(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
            showToast("Course deleted");
        } catch (err) {
            console.error(err);
            setCourses(prev => prev.filter(c => c.courseId !== id && c.id !== id));
            setModulesByCourse(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
            showToast("Course deleted (offline)", "info");
        }
    };

    const addModule = async (courseId, payload) => {
        try {
            setLoading(prev => ({ ...prev, modules: true }));
            const res = await axios.post("https://localhost:7281/api/Module", { courseId, ...payload });
            const created = res.data || { moduleId: Date.now(), courseId, ...payload };
            setModulesByCourse(prev => ({ ...prev, [courseId]: [created, ...(prev[courseId] || [])] }));
            showToast("Module added", "success");
            return created;
        } catch (err) {
            console.error(err);
            const created = { moduleId: Date.now(), courseId, ...payload };
            setModulesByCourse(prev => ({ ...prev, [courseId]: [created, ...(prev[courseId] || [])] }));
            showToast("Module added (offline)", "info");
            return created;
        } finally {
            setLoading(prev => ({ ...prev, modules: false }));
        }
    };

    const updateModule = async (moduleId, courseId, payload) => {
        try {
            await axios.put(`https://localhost:7281/api/Module/${moduleId}`, payload);
            setModulesByCourse(prev => ({
                ...prev,
                [courseId]: (prev[courseId] || []).map(m => (m.moduleId === moduleId || m.id === moduleId) ? { ...m, ...payload } : m)
            }));
            showToast("Module updated");
        } catch (err) {
            console.error(err);
            setModulesByCourse(prev => ({
                ...prev,
                [courseId]: (prev[courseId] || []).map(m => (m.moduleId === moduleId || m.id === moduleId) ? { ...m, ...payload } : m)
            }));
            showToast("Module updated (offline)", "info");
        }
    };

    const deleteModule = async (moduleId, courseId) => {
        try {
            await axios.delete(`https://localhost:7281/api/Module/${moduleId}`);
            setModulesByCourse(prev => ({ ...prev, [courseId]: (prev[courseId] || []).filter(m => m.moduleId !== moduleId && m.id !== moduleId) }));
            showToast("Module deleted");
        } catch (err) {
            console.error(err);
            setModulesByCourse(prev => ({ ...prev, [courseId]: (prev[courseId] || []).filter(m => m.moduleId !== moduleId && m.id !== moduleId) }));
            showToast("Module deleted (offline)", "info");
        }
    };

    // --- Assign lecturers/students to courses ---
    const assignLecturerToCourse = async (courseId, lecturerId) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const url = `https://localhost:7281/api/Course/${courseId}/assign-lecturer/${lecturerId}`;
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            // call backend PUT endpoint
            await axios.put(url, null, config);

            // local reflect: attach lecturerId to course
            setCourses(prev => prev.map(c => (c.courseId === courseId || c.id === courseId) ? { ...c, lecturerId } : c));
            showToast("Lecturer assigned to course");
        } catch (err) {
            console.error("Assign lecturer failed:", err?.response || err);
            // optimistic update so UI remains responsive
            setCourses(prev => prev.map(c => (c.courseId === courseId || c.id === courseId) ? { ...c, lecturerId } : c));
            showToast("Lecturer assigned (offline)", "info");
        }
    };

    const assignStudentToCourse = async (courseId, studentId) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const url = `https://localhost:7281/api/Course/${courseId}/assign-student/${studentId}`;
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            // call backend PUT endpoint (no body)
            await axios.put(url, null, config);

            // local reflect: add student to course.students array
            setCourses(prev => prev.map(c => {
                if (c.courseId === courseId || c.id === courseId) {
                    const studentsList = c.students ? [...c.students] : [];
                    if (!studentsList.find(s => s === studentId)) studentsList.push(studentId);
                    return { ...c, students: studentsList };
                }
                return c;
            }));
            showToast("Student assigned to course");
        } catch (err) {
            console.error("Assign student failed:", err?.response || err);
            // optimistic update
            setCourses(prev => prev.map(c => {
                if (c.courseId === courseId || c.id === courseId) {
                    const studentsList = c.students ? [...c.students] : [];
                    if (!studentsList.find(s => s === studentId)) studentsList.push(studentId);
                    return { ...c, students: studentsList };
                }
                return c;
            }));
            showToast("Student assigned (offline)", "info");
        }
    };

    // --- Utility: build payload from form for different entities ---
    const buildPayload = () => {
        if (modalEntity === "lecturer") {
            return {
                name: form.name,
                surname: form.surname,
                gender: form.gender || "NotSpecified",
                dateOfBirth: form.dateOfBirth || null,
                homeAddress: form.homeAddress || "",
                emailAddress: form.emailAddress || form.email || "",
                telephoneNumber: form.phoneNumber || form.telephoneNumber || ""
            };
        }
        if (modalEntity === "student") {
            return {
                studentNumber: form.studentNumber,
                name: form.name,
                surname: form.surname,
                gender: form.gender || "NotSpecified",
                dateOfBirth: form.dateOfBirth || null,
                homeAddress: form.homeAddress || "",
                emailAddress: form.emailAddress || form.email || "",
                phoneNumber: form.phoneNumber || ""
            };
        }
        if (modalEntity === "course") {
            return { name: form.courseName, code: form.courseCode };
        }
        if (modalEntity === "module") {
            return { name: form.moduleName, code: form.moduleCode, courseId: form.courseId || form.selectedCourseId };
        }
        return {};
    };

    // --- Show / hide modal helpers for different entities ---
    const openAddModal = (entity, extras = {}) => {
        setModalType("add");
        setModalEntity(entity);
        setForm(prev => ({ ...prev, ...getEmptyFormFor(entity), ...extras }));
        setShowModal(true);
    };

    const openEditModal = (item, entity, extras = {}) => {
        setModalType("edit");
        setModalEntity(entity);
        // map item to form
        const mapped = mapItemToForm(item, entity);
        setForm({ ...getEmptyFormFor(entity), ...mapped, ...extras, id: item.studentId || item.lecturerId || item.courseId || item.moduleId || item.id });
        setShowModal(true);
    };

    const getEmptyFormFor = (entity) => {
        switch (entity) {
            case "lecturer": return { staffNumber: "", name: "", surname: "", dateOfBirth: "", homeAddress: "", phoneNumber: "", gender: "", emailAddress: "" };
            case "student": return { studentNumber: "", name: "", surname: "", dateOfBirth: "", homeAddress: "", phoneNumber: "", gender: "", emailAddress: "" };
            case "course": return { courseName: "", courseCode: "" };
            case "module": return { moduleName: "", moduleCode: "", courseId: "" };
            case "assign": return { assignCourseId: "", assignLecturerId: "", assignStudentId: "" };
            default: return {};
        }
    };

    const mapItemToForm = (item, entity) => {
        if (entity === "lecturer") {
            return {
                staffNumber: item.staffNumber || "",
                name: item.name || "",
                surname: item.surname || "",
                dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().slice(0, 10) : "",
                homeAddress: item.homeAddress || "",
                phoneNumber: item.phoneNumber || "",
                gender: item.gender || "",
                emailAddress: item.emailAddress || item.email || ""
            };
        }
        if (entity === "student") {
            return {
                studentNumber: item.studentNumber || "",
                name: item.name || "",
                surname: item.surname || "",
                dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().slice(0, 10) : "",
                homeAddress: item.homeAddress || "",
                phoneNumber: item.phoneNumber || "",
                gender: item.gender || "",
                emailAddress: item.emailAddress || item.email || ""
            };
        }
        if (entity === "course") {
            return { courseName: item.name || "", courseCode: item.code || item.courseCode || "" };
        }
        if (entity === "module") {
            return { moduleName: item.name || "", moduleCode: item.code || item.moduleCode || "", courseId: item.courseId || item.courseId };
        }
        return {};
    };

    // --- handle modal submit for any entity ---
    const handleSubmitModal = async () => {
        try {
            if (modalEntity === "lecturer") {
                const payload = buildPayload();
                if (modalType === "add") await addLecturer(payload);
                else await updateLecturer(form.id, payload);
            } else if (modalEntity === "student") {
                const payload = buildPayload();
                if (modalType === "add") await addStudent(payload);
                else await updateStudent(form.id, payload);
            } else if (modalEntity === "course") {
                const payload = buildPayload();
                if (modalType === "add") await addCourse(payload);
                else await updateCourse(form.id, payload);
            } else if (modalEntity === "module") {
                const payload = buildPayload();
                const courseId = payload.courseId || form.courseId || form.selectedCourseId;
                if (!courseId) { showToast("Select a course for the module", "danger"); return; }
                if (modalType === "add") await addModule(courseId, payload);
                else await updateModule(form.id, courseId, payload);
            } else if (modalEntity === "assign") {
                if (form.assignLecturerId && form.assignCourseId) {
                    await assignLecturerToCourse(form.assignCourseId, form.assignLecturerId);
                }
                if (form.assignStudentId && form.assignCourseId) {
                    await assignStudentToCourse(form.assignCourseId, form.assignStudentId);
                }
            }
            setShowModal(false);
        } catch (err) {
            console.error(err);
            showToast("Operation failed", "danger");
        }
    };

    const handleDelete = async (id, type) => {
        const confirm = window.confirm("Delete this item? This action cannot be undone.");
        if (!confirm) return;
        try {
            if (type === "lecturer") await deleteLecturer(id);
            else if (type === "student") await deleteStudent(id);
            else if (type === "course") await deleteCourse(id);
            else if (type === "module") {
                // need courseId in form.id or passed in extras; here assume id encodes courseId: "courseId:moduleId" not ideal
                // simpler: UI delete button should call deleteModule(moduleId, courseId)
            }
        } catch (err) {
            console.error(err);
            showToast("Delete failed", "danger");
        }
    };

    // --- Search helpers: include studentNumber / staffNumber ---
    const getFiltered = (items, type) => {
        const q = search.toLowerCase();
        const filtered = items.filter(it => {
            if (!q) return true;
            if (type === "students") {
                return (it.studentNumber && it.studentNumber.toLowerCase().includes(q)) ||
                    (it.name && it.name.toLowerCase().includes(q)) ||
                    (it.surname && it.surname.toLowerCase().includes(q));
            }
            if (type === "lecturers") {
                return (it.staffNumber && it.staffNumber.toLowerCase().includes(q)) ||
                    (it.name && it.name.toLowerCase().includes(q)) ||
                    (it.surname && it.surname.toLowerCase().includes(q));
            }
            // generic
            return (it.name && it.name.toLowerCase().includes(q)) || (it.surname && it.surname.toLowerCase().includes(q));
        });
        const sorted = filtered.sort((a, b) => {
            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            if (an < bn) return sortAsc ? -1 : 1;
            if (an > bn) return sortAsc ? 1 : -1;
            return 0;
        });
        return sorted;
    };

    const displayedLecturers = useMemo(() => {
        const list = getFiltered(lecturers, "lecturers");
        const start = (page - 1) * PAGE_SIZE;
        return { pageItems: list.slice(start, start + PAGE_SIZE), total: list.length };
    }, [lecturers, search, sortAsc, page]);

    const displayedStudents = useMemo(() => {
        const list = getFiltered(students, "students");
        const start = (page - 1) * PAGE_SIZE;
        return { pageItems: list.slice(start, start + PAGE_SIZE), total: list.length };
    }, [students, search, sortAsc, page]);

    const displayedCourses = useMemo(() => {
        const q = search.toLowerCase();
        const filtered = courses.filter(c => !q || (c.name && c.name.toLowerCase().includes(q)) || (c.code && c.code.toLowerCase().includes(q)));
        return { pageItems: filtered, total: filtered.length };
    }, [courses, search]);

    const resetPaging = () => setPage(1);
    useEffect(() => resetPaging(), [activeTab, search, sortAsc]);

    // small helpers
    const showToast = (message, variant = "success") => {
        setToast({ show: true, message, variant });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    };

    const handleModalChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // --- UI: render ---
    return (
        <>
            <style>{`
                .app-topbar { background: linear-gradient(90deg,#ffffff,#fbfbff); border-bottom: 1px solid rgba(0,0,0,0.04); }
                .sidebar { background: linear-gradient(180deg,#f7f9ff,#f1f3ff); }
                .search-input { min-width: 420px; }
            `}</style>

            <Container fluid className="p-0">
                <div className="app-topbar p-2 d-flex align-items-center justify-content-between px-3">
                    <div className="d-flex align-items-center gap-3">
                        <Button variant="link" className="p-0" style={{ fontSize: 20, color: "#6f42c1" }}>☰</Button>
                        <div className="d-flex align-items-center">
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(90deg,#6f42c1,#7b5cf6)" }} />
                            <div className="ms-2 fw-bold" style={{ color: "#6f42c1" }}>Educore</div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center">
                        <InputGroup className="me-3 search-input">
                            <Form.Control placeholder="Search..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                            <Button variant="primary" onClick={() => setSearch(searchInput.trim())}>Search</Button>
                        </InputGroup>

                        <div className="d-flex align-items-center gap-3">
                            <div style={{ fontSize: 18, color: "#6c757d" }}>🌙</div>
                            <div style={{ fontSize: 18, color: "#6c757d" }}>🔔</div>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ede9ff" }} />
                        </div>
                    </div>
                </div>

                {error && <Alert variant="danger" className="m-3">{error}</Alert>}

                <Row className="g-0 px-4 pt-4">
                    <Col lg={2} className="pe-0">
                        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </Col>

                    <Col lg={10} className="p-4">
                        <div className="admin-banner d-flex align-items-center justify-content-between" style={{ borderRadius: 12, background: "linear-gradient(90deg,#6f42c1,#7b5cf6)", color: "#fff", padding: 20 }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
                                <div style={{ opacity: 0.9 }}>Manage users, courses and modules</div>
                            </div>
                            <div className="text-end">
                                <Badge bg="light" text="dark" className="me-2">Super Admin</Badge>
                                <div className="small text-white-50">Last login: just now</div>
                            </div>
                        </div>

                        <Card className="shadow-sm mb-3" style={{ borderRadius: 12 }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h5 className="mb-0">Administrator Tools</h5>
                                        <div className="text-muted small">Quick actions and user management</div>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <Badge bg="secondary">Sort: {sortAsc ? "A→Z" : "Z→A"}</Badge>
                                        <Button size="sm" variant="outline-secondary" onClick={() => setSortAsc(s => !s)}>Toggle Sort</Button>
                                    </div>
                                </div>

                                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                                    <Nav.Item><Nav.Link eventKey="lecturers">Lecturers</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="students">Students</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="courses">Courses</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="modules">Modules</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="assign">Assignments</Nav.Link></Nav.Item>
                                </Nav>

                                {/* Lecturers */}
                                {activeTab === "lecturers" && (
                                    <>
                                        <div className="mb-3 d-flex gap-2">
                                            <InputGroup style={{ maxWidth: 420 }}>
                                                <Form.Control placeholder="Search staff number, name or surname" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                                                <Button variant="primary" onClick={() => setSearch(searchInput.trim())}>Search</Button>
                                            </InputGroup>
                                            <div className="ms-auto">
                                                <Button onClick={() => openAddModal("lecturer")}>Add Lecturer</Button>
                                            </div>
                                        </div>

                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Staff #</th>
                                                    <th>First Name</th>
                                                    <th>Last Name</th>
                                                    <th>DOB</th>
                                                    <th>Address</th>
                                                    <th>Phone</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading.lecturers ? (
                                                    <tr><td colSpan="8" className="text-center"><Spinner animation="border" /> Loading...</td></tr>
                                                ) : displayedLecturers.pageItems.length > 0 ? (
                                                    displayedLecturers.pageItems.map((item, i) => (
                                                        <tr key={item.lecturerId || item.id || i}>
                                                            <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                                                            <td>{item.staffNumber || "—"}</td>
                                                            <td>{item.name || "N/A"}</td>
                                                            <td>{item.surname || "N/A"}</td>
                                                            <td>{item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : "N/A"}</td>
                                                            <td>{item.homeAddress || "N/A"}</td>
                                                            <td>{item.phoneNumber || item.telephoneNumber || "N/A"}</td>
                                                            <td className="text-center">
                                                                <Button size="sm" variant="outline-primary" onClick={() => openEditModal(item, "lecturer")}>Edit</Button>{' '}
                                                                <Button size="sm" variant="outline-danger" onClick={() => deleteLecturer(item.lecturerId || item.id)}>Delete</Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="8" className="text-center">No lecturers found</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </>
                                )}

                                {/* Students */}
                                {activeTab === "students" && (
                                    <>
                                        <div className="mb-3 d-flex gap-2">
                                            <InputGroup style={{ maxWidth: 420 }}>
                                                <Form.Control placeholder="Search student number, name or surname" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                                                <Button variant="primary" onClick={() => setSearch(searchInput.trim())}>Search</Button>
                                            </InputGroup>
                                            <div className="ms-auto">
                                                <Button onClick={() => openAddModal("student")}>Add Student</Button>
                                            </div>
                                        </div>

                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Student #</th>
                                                    <th>First Name</th>
                                                    <th>Last Name</th>
                                                    <th>DOB</th>
                                                    <th>Address</th>
                                                    <th>Phone</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading.students ? (
                                                    <tr><td colSpan="8" className="text-center"><Spinner animation="border" /> Loading...</td></tr>
                                                ) : displayedStudents.pageItems.length > 0 ? (
                                                    displayedStudents.pageItems.map((item, i) => (
                                                        <tr key={item.studentId || item.id || i}>
                                                            <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                                                            <td>{item.studentNumber || "—"}</td>
                                                            <td>{item.name || "N/A"}</td>
                                                            <td>{item.surname || "N/A"}</td>
                                                            <td>{item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : "N/A"}</td>
                                                            <td>{item.homeAddress || "N/A"}</td>
                                                            <td>{item.phoneNumber || "N/A"}</td>
                                                            <td className="text-center">
                                                                <Button size="sm" variant="outline-primary" onClick={() => openEditModal(item, "student")}>Edit</Button>{' '}
                                                                <Button size="sm" variant="outline-danger" onClick={() => deleteStudent(item.studentId || item.id)}>Delete</Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="8" className="text-center">No students found</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </>
                                )}

                                {/* Courses */}
                                {activeTab === "courses" && (
                                    <>
                                        <div className="mb-3 d-flex gap-2">
                                            <InputGroup style={{ maxWidth: 420 }}>
                                                <Form.Control placeholder="Search courses..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                                                <Button variant="primary" onClick={() => setSearch(searchInput.trim())}>Search</Button>
                                            </InputGroup>
                                            <div className="ms-auto">
                                                <Button onClick={() => openAddModal("course")}>Add Course</Button>
                                            </div>
                                        </div>

                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Code</th>
                                                    <th>Lecturer</th>
                                                    <th>Students</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading.courses ? (
                                                    <tr><td colSpan="6" className="text-center"><Spinner animation="border" /> Loading...</td></tr>
                                                ) : displayedCourses.pageItems.length > 0 ? (
                                                    displayedCourses.pageItems.map((c, i) => (
                                                        <tr key={c.courseId || c.id || i}>
                                                            <td>{i + 1}</td>
                                                            <td>{c.name}</td>
                                                            <td>{c.code || c.courseCode || "—"}</td>
                                                            <td>{(lecturers.find(l => (l.lecturerId === c.lecturerId || l.id === c.lecturerId)) || {}).name ? `${(lecturers.find(l => (l.lecturerId === c.lecturerId || l.id === c.lecturerId)) || {}).name} ${(lecturers.find(l => (l.lecturerId === c.lecturerId || l.id === c.lecturerId)) || {}).surname || ''}` : "—"}</td>
                                                            <td>{c.students ? c.students.length : "—"}</td>
                                                            <td className="text-center">
                                                                <Button size="sm" variant="outline-primary" onClick={() => { openEditModal(c, "course"); getModulesForCourse(c.courseId || c.id); }}>Edit</Button>{' '}
                                                                <Button size="sm" variant="outline-secondary" onClick={() => openAddModal("module", { courseId: c.courseId || c.id, selectedCourseId: c.courseId || c.id })}>Add Module</Button>{' '}
                                                                <Button size="sm" variant="outline-danger" onClick={() => deleteCourse(c.courseId || c.id)}>Delete</Button>{' '}
                                                                <Button size="sm" variant="outline-info" onClick={() => openAddModal("assign", { assignCourseId: c.courseId || c.id })}>Assign</Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="6" className="text-center">No courses found</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </>
                                )}

                                {/* Modules */}
                                {activeTab === "modules" && (
                                    <>
                                        <div className="mb-3 d-flex gap-2">
                                            <InputGroup style={{ maxWidth: 420 }}>
                                                <Form.Select name="courseFilter" onChange={(e) => getModulesForCourse(e.target.value)} defaultValue="">
                                                    <option value="">-- Select course to view modules --</option>
                                                    {courses.map(c => <option key={c.courseId || c.id} value={c.courseId || c.id}>{c.name}</option>)}
                                                </Form.Select>
                                                <Button variant="primary" onClick={() => setSearch(searchInput.trim())}>Search</Button>
                                            </InputGroup>
                                            <div className="ms-auto">
                                                <Button onClick={() => openAddModal("module")}>Add Module</Button>
                                            </div>
                                        </div>

                                        <div className="mb-2 text-muted">Modules are listed per selected course above.</div>
                                        {Object.keys(modulesByCourse).map(courseId => (
                                            <Card key={courseId} className="mb-2">
                                                <Card.Header>
                                                    Modules for { (courses.find(c => (c.courseId === courseId || c.id === courseId)) || {}).name || courseId }
                                                </Card.Header>
                                                <Card.Body>
                                                    <Table responsive striped bordered>
                                                        <thead>
                                                            <tr><th>#</th><th>Name</th><th>Code</th><th>Actions</th></tr>
                                                        </thead>
                                                        <tbody>
                                                            {(modulesByCourse[courseId] || []).map((m, idx) => (
                                                                <tr key={m.moduleId || m.id || idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td>{m.name}</td>
                                                                    <td>{m.code || m.moduleCode || "—"}</td>
                                                                    <td>
                                                                        <Button size="sm" variant="outline-primary" onClick={() => openEditModal(m, "module", { courseId })}>Edit</Button>{' '}
                                                                        <Button size="sm" variant="outline-danger" onClick={() => deleteModule(m.moduleId || m.id, courseId)}>Delete</Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                    <div className="text-muted small">Total: {(modulesByCourse[courseId] || []).length}</div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </>
                                )}

                                {/* Assign */}
                                {activeTab === "assign" && (
                                    <>
                                        <div className="mb-3 d-flex gap-2">
                                            <InputGroup style={{ maxWidth: 680 }}>
                                                <Form.Select name="assignCourse" value={form.assignCourseId} onChange={(e) => setForm(prev => ({ ...prev, assignCourseId: e.target.value }))}>
                                                    <option value="">Select course</option>
                                                    {courses.map(c => <option key={c.courseId || c.id} value={c.courseId || c.id}>{c.name}</option>)}
                                                </Form.Select>
                                                <Form.Select name="assignLecturer" value={form.assignLecturerId} onChange={(e) => setForm(prev => ({ ...prev, assignLecturerId: e.target.value }))}>
                                                    <option value="">Select lecturer</option>
                                                    {lecturers.map(l => <option key={l.lecturerId || l.id} value={l.lecturerId || l.id}>{l.name} {l.surname}</option>)}
                                                </Form.Select>
                                                <Form.Select name="assignStudent" value={form.assignStudentId} onChange={(e) => setForm(prev => ({ ...prev, assignStudentId: e.target.value }))}>
                                                    <option value="">Select student</option>
                                                    {students.map(s => <option key={s.studentId || s.id} value={s.studentId || s.id}>{s.name} {s.surname}</option>)}
                                                </Form.Select>
                                                <Button variant="primary" onClick={() => handleSubmitModal()}>Assign</Button>
                                            </InputGroup>
                                            <div className="ms-auto">
                                                <Button onClick={() => openAddModal("assign")}>Open assign modal</Button>
                                            </div>
                                        </div>
                                        <div className="text-muted small">Use above to assign a lecturer or student to a course. Assignments are reflected locally and sent to backend when available.</div>
                                    </>
                                )}
                            </Card.Body>
                        </Card>

                        <Row>
                            <Col md={6}>
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        <h6 className="mb-3">Quick Actions</h6>
                                        <div className="d-flex justify-content-between mb-2">
                                            <div>Lecturers</div>
                                            <Badge bg="info">{lecturers.length}</Badge>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3">
                                            <div>Students</div>
                                            <Badge bg="info">{students.length}</Badge>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <Button variant="outline-primary" onClick={() => setActiveTab("lecturers")}>Go to Lecturers</Button>
                                            <Button variant="outline-secondary" onClick={() => showToast("This is a demo toast", "info")}>Demo Toast</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        <h6 className="mb-3">Reports</h6>
                                        <div className="small text-muted">Recent activity and quick stats will appear here.</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            {/* Add/Edit Modal (single modal reused for all entity types) */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalType === "add" ? "Add" : "Edit"} {modalEntity}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {modalEntity === "lecturer" && (
                            <>
                                <Form.Group className="mb-2"><Form.Label>Staff Number</Form.Label><Form.Control name="staffNumber" value={form.staffNumber} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>First Name</Form.Label><Form.Control name="name" value={form.name} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Last Name</Form.Label><Form.Control name="surname" value={form.surname} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control name="emailAddress" value={form.emailAddress} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Gender</Form.Label>
                                    <Form.Select name="gender" value={form.gender} onChange={handleModalChange}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Date of Birth</Form.Label><Form.Control type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Home Address</Form.Label><Form.Control name="homeAddress" value={form.homeAddress} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Telephone</Form.Label><Form.Control name="phoneNumber" value={form.phoneNumber} onChange={handleModalChange} /></Form.Group>
                            </>
                        )}

                        {modalEntity === "student" && (
                            <>
                                <Form.Group className="mb-2"><Form.Label>Student Number</Form.Label><Form.Control name="studentNumber" value={form.studentNumber} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>First Name</Form.Label><Form.Control name="name" value={form.name} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Last Name</Form.Label><Form.Control name="surname" value={form.surname} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control name="emailAddress" value={form.emailAddress} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Date of Birth</Form.Label><Form.Control type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Home Address</Form.Label><Form.Control name="homeAddress" value={form.homeAddress} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Phone</Form.Label><Form.Control name="phoneNumber" value={form.phoneNumber} onChange={handleModalChange} /></Form.Group>
                            </>
                        )}

                        {modalEntity === "course" && (
                            <>
                                <Form.Group className="mb-2"><Form.Label>Course name</Form.Label><Form.Control name="courseName" value={form.courseName} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Course code</Form.Label><Form.Control name="courseCode" value={form.courseCode} onChange={handleModalChange} /></Form.Group>
                            </>
                        )}

                        {modalEntity === "module" && (
                            <>
                                <Form.Group className="mb-2"><Form.Label>Module name</Form.Label><Form.Control name="moduleName" value={form.moduleName} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Module code</Form.Label><Form.Control name="moduleCode" value={form.moduleCode} onChange={handleModalChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Course</Form.Label>
                                    <Form.Select name="courseId" value={form.courseId || form.selectedCourseId || ""} onChange={handleModalChange}>
                                        <option value="">Select course</option>
                                        {courses.map(c => <option key={c.courseId || c.id} value={c.courseId || c.id}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </>
                        )}

                        {modalEntity === "assign" && (
                            <>
                                <Form.Group className="mb-2"><Form.Label>Course</Form.Label>
                                    <Form.Select name="assignCourseId" value={form.assignCourseId} onChange={handleModalChange}>
                                        <option value="">Select course</option>
                                        {courses.map(c => <option key={c.courseId || c.id} value={c.courseId || c.id}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Lecturer</Form.Label>
                                    <Form.Select name="assignLecturerId" value={form.assignLecturerId} onChange={handleModalChange}>
                                        <option value="">Select lecturer</option>
                                        {lecturers.map(l => <option key={l.lecturerId || l.id} value={l.lecturerId || l.id}>{l.name} {l.surname}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Student</Form.Label>
                                    <Form.Select name="assignStudentId" value={form.assignStudentId} onChange={handleModalChange}>
                                        <option value="">Select student</option>
                                        {students.map(s => <option key={s.studentId || s.id} value={s.studentId || s.id}>{s.name} {s.surname}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmitModal}>{modalType === "add" ? "Add" : "Save"}</Button>
                </Modal.Footer>
            </Modal>

            {/* Toast */}
            <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1060 }}>
                <Toast show={toast.show} bg={toast.variant === "danger" ? "danger" : (toast.variant === "info" ? "info" : "success")} onClose={() => setToast(t => ({ ...t, show: false }))}>
                    <Toast.Header>
                        <strong className="me-auto">Educore</strong>
                        <small>now</small>
                    </Toast.Header>
                    <Toast.Body className="text-white">{toast.message}</Toast.Body>
                </Toast>
            </div>
        </>
    );
};

export default ADMIN;