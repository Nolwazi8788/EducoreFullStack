import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Modal,
} from "react-bootstrap";
import axios from "axios";

const SummaryCard = ({ title, value, subtitle, bg, icon }) => (
  <Card
    className="text-white mb-3 shadow-sm"
    style={{ background: bg, border: "none" }}
  >
    <Card.Body className="d-flex align-items-center">
      <div style={{ fontSize: 28, lineHeight: 1 }} className="me-3">
        {icon}
      </div>
      <div className="flex-grow-1">
        <div className="small text-uppercase opacity-75">{title}</div>
        <div className="h4 mb-1 fw-bold">{value}</div>
        <div className="small opacity-75">{subtitle}</div>
      </div>
    </Card.Body>
  </Card>
);

const Sidebar = ({ active, setActive }) => (
  <div
    className="sidebar p-3 d-flex flex-column"
    style={{
      minHeight: "85vh",
      background: "#f8fafc",
      borderRight: "1px solid rgba(0,0,0,0.04)",
    }}
  >
    <div className="mb-4 d-flex align-items-center">
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: "#6f42c1",
        }}
        className="me-2"
      />
      <div>
        <div className="fw-bold">EDUCORE</div>
        <div className="small text-muted">Lecturer</div>
      </div>
    </div>

    <div className="d-flex flex-column" role="menu">
      <Button
        variant={active === "dashboard" ? "primary" : "link"}
        className="text-start mb-1"
        onClick={() => setActive("dashboard")}
      >
        🏠 Dashboard
      </Button>
      <Button
        variant={active === "courses" ? "primary" : "link"}
        className="text-start mb-1"
        onClick={() => setActive("courses")}
      >
        📚 Courses
      </Button>
      <Button
        variant={active === "modules" ? "primary" : "link"}
        className="text-start mb-1"
        onClick={() => setActive("modules")}
      >
        📦 Modules
      </Button>
      <Button
        variant={active === "tasks" ? "primary" : "link"}
        className="text-start mb-1"
        onClick={() => setActive("tasks")}
      >
        📝 Tasks
      </Button>
    </div>

    <div className="mt-auto">
      <hr />
      <Button
        variant="outline-danger"
        size="sm"
        className="w-100"
        onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }}
      >
        Logout
      </Button>
    </div>
  </div>
);

const LECTURER = () => {
  const lecturerId = 'l1'; // replace with real lecturer id when available
  const [active, setActive] = useState("dashboard");
  // static sample data (will be preserved if backend is unavailable)
  const [courses, setCourses] = useState([
    { courseId: 'c1', name: 'Computer Science', code: 'CS101' },
    { courseId: 'c2', name: 'Information Systems', code: 'IS201' },
    { courseId: 'c3', name: 'Mathematics', code: 'MATH150' },
    { courseId: 'c4', name: 'Physics', code: 'PHY110' }
  ]);
  const [modules, setModules] = useState([
    { moduleId: 'm1', name: 'Intro to Programming', moduleCode: 'CS101-A', courseId: 'c1' },
    { moduleId: 'm2', name: 'Data Structures', moduleCode: 'CS101-B', courseId: 'c1' },
    { moduleId: 'm3', name: 'Systems Analysis', moduleCode: 'IS201-A', courseId: 'c2' },
    { moduleId: 'm4', name: 'Database Design', moduleCode: 'IS201-B', courseId: 'c2' },
    { moduleId: 'm5', name: 'Calculus I', moduleCode: 'MATH150-A', courseId: 'c3' },
    { moduleId: 'm6', name: 'Mechanics', moduleCode: 'PHY110-A', courseId: 'c4' }
  ]);
  const [tasks, setTasks] = useState([
    { taskId: 't1', taskName: 'Programming Assignment 1', dueDate: new Date(Date.now() + 3*24*3600*1000).toISOString(), moduleId: 'm1', moduleName: 'Intro to Programming', lecturerId: 'l1', studentIds: ['s1','s2'] },
    { taskId: 't2', taskName: 'Data Structures Quiz', dueDate: new Date(Date.now() + 7*24*3600*1000).toISOString(), moduleId: 'm2', moduleName: 'Data Structures', lecturerId: 'l1', studentIds: ['s1','s3','s4'] },
    { taskId: 't3', taskName: 'Database Project', dueDate: new Date(Date.now() + 14*24*3600*1000).toISOString(), moduleId: 'm4', moduleName: 'Database Design', lecturerId: 'l2', studentIds: ['s2','s5'] },
    { taskId: 't4', taskName: 'Calculus Test', dueDate: new Date(Date.now() + 5*24*3600*1000).toISOString(), moduleId: 'm5', moduleName: 'Calculus I', lecturerId: 'l3', studentIds: ['s6'] }
  ]);
  const [students, setStudents] = useState([
    { studentId: 's1', studentNumber: 'STU-001', name: 'Alice', surname: 'Mokgadi' },
    { studentId: 's2', studentNumber: 'STU-002', name: 'Brian', surname: 'Thabo' },
    { studentId: 's3', studentNumber: 'STU-003', name: 'Chloe', surname: 'Naidoo' },
    { studentId: 's4', studentNumber: 'STU-004', name: 'Daniel', surname: 'Masuku' },
    { studentId: 's5', studentNumber: 'STU-005', name: 'Elena', surname: 'Sibiya' },
    { studentId: 's6', studentNumber: 'STU-006', name: 'Faisal', surname: 'Patel' }
  ]);
  const [search, setSearch] = useState("");

  // Form states
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStudentForm, setEditingStudentForm] = useState({ name: "", surname: "", studentNumber: "" });

  useEffect(() => {
    fetchAssignedData();
    fetchTasks();
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  const fetchAssignedData = () => {
    // TODO: replace base URL if different
    axios
      .get(`https://localhost:7013/api/Lecturer/Assigned/${lecturerId}`)
      .then((res) => {
        // expected shape: { courses: [...], modules: [...] }
        const data = res.data || {};
        if (Array.isArray(data.courses) && data.courses.length > 0) setCourses(data.courses);
        if (Array.isArray(data.modules) && data.modules.length > 0) setModules(data.modules);
      })
      .catch((err) => {
        console.error("fetchAssignedData error:", err);
        // keep local static data on error
      });
  };

  const fetchStudents = () => {
    // fetch all students and filter locally per course/module below
    axios
      .get("https://localhost:7013/api/Student/ReadingStudents")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) setStudents(res.data);
      })
      .catch((err) => {
        console.error("fetchStudents error:", err);
        // keep static sample students
      });
  };

  const fetchTasks = () => {
    axios
      .get(`https://localhost:7013/api/Task/Lecturer/${lecturerId}`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) setTasks(res.data);
      })
      .catch((err) => {
        console.error("fetchTasks error:", err);
        // keep static sample tasks
      });
  };

  const clearTaskForm = () => {
    setTaskName("");
    setDueDate("");
    setSelectedModule("");
    setSelectedStudents([]);
  };

  const openEditStudentModal = (studentId) => {
    const s = students.find(st => (st.studentId || st.id) === studentId);
    if (!s) return;
    setEditingStudentId(studentId);
    setEditingStudentForm({ name: s.name || "", surname: s.surname || "", studentNumber: s.studentNumber || s.studentId || "" });
    setShowEditStudentModal(true);
  };

  const closeEditStudentModal = () => {
    setShowEditStudentModal(false);
    setEditingStudentId(null);
    setEditingStudentForm({ name: "", surname: "", studentNumber: "" });
  };

  const handleSaveStudentEdit = async () => {
    if (!editingStudentId) return;
    const prevStudents = [...students];
    const prevStudent = students.find(s => (s.studentId || s.id) === editingStudentId);

    // optimistic update
    setStudents(prev => prev.map(s => ((s.studentId || s.id) === editingStudentId) ? { ...s, name: editingStudentForm.name, surname: editingStudentForm.surname, studentNumber: editingStudentForm.studentNumber } : s));
    closeEditStudentModal();

    // prepare payload for Student API
    const payload = {
      studentNumber: editingStudentForm.studentNumber,
      name: editingStudentForm.name,
      surname: editingStudentForm.surname
    };

    // try primary endpoint, then fallback
    const id = editingStudentId;
    const endpoints = [
      `https://localhost:7281/api/Student/${id}`,
      `https://localhost:7013/api/Student/${id}`
    ];

    let success = false;
    for (const url of endpoints) {
      try {
        await axios.put(url, payload);
        success = true;
        break;
      } catch (err) {
        // try next
        console.error(`PUT ${url} failed:`, err?.response || err);
      }
    }

    if (!success) {
      // rollback
      setStudents(prevStudents);
      window.alert("Failed to save student changes to server. Changes were reverted locally.");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const ok = window.confirm("Delete this student? This will remove them from lists.");
    if (!ok) return;

    // optimistic removal
    const prevStudents = [...students];
    const prevSelected = [...selectedStudents];
    setStudents(prev => prev.filter(s => (s.studentId || s.id) !== studentId));
    setSelectedStudents(prev => prev.filter(id => id !== studentId));

    // try backend delete endpoints
    const endpoints = [
      `https://localhost:7281/api/Student/DeletingStudents/${studentId}`,
      `https://localhost:7013/api/Student/DeletingStudents/${studentId}`,
      `https://localhost:7281/api/Student/${studentId}`,
      `https://localhost:7013/api/Student/${studentId}`
    ];

    let success = false;
    for (const url of endpoints) {
      try {
        await axios.delete(url);
        success = true;
        break;
      } catch (err) {
        console.error(`DELETE ${url} failed:`, err?.response || err);
      }
    }

    if (!success) {
      // rollback
      setStudents(prevStudents);
      setSelectedStudents(prevSelected);
      window.alert("Failed to delete student on server. Local deletion was reverted.");
    }
  };

  const handleAddTask = () => {
    if (!taskName || !dueDate || !selectedModule) {
      alert("Please complete Task Name, Due Date and Module");
      return;
    }

    // generate taskId client-side if backend doesn't create one
    const taskId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `task-${Date.now()}`;

    // find module name
    const moduleObj = modules.find((m) => (m.moduleId || m.ModuleId || m.id) === selectedModule);
    const moduleName = moduleObj ? (moduleObj.name || moduleObj.Name) : "";

    const payload = {
      taskId,
      taskName,
      dueDate,
      moduleId: selectedModule,
      moduleName,
      lecturerId,
      studentIds: selectedStudents, // array of student ids
    };

    axios
      .post("https://localhost:7013/api/Task", payload)
      .then(() => {
        fetchTasks();
        clearTaskForm();
        setActive("tasks");
      })
      .catch((err) => {
        console.error("handleAddTask error:", err);
        // fallback: add locally so UI reflects change
        const localTask = {
          taskId,
          taskName,
          dueDate,
          moduleId: selectedModule,
          moduleName,
          lecturerId,
          studentIds: selectedStudents,
        };
        setTasks((prev) => [localTask, ...prev]);
        clearTaskForm();
        setActive("tasks");
      });
  };

  // students available for selected module (filter by courseId on module)
  const studentsForSelectedModule = (() => {
    if (!selectedModule) return [];
    const mod = modules.find((m) => (m.moduleId || m.ModuleId || m.id) === selectedModule);
    if (!mod) return [];
    const courseId = mod.courseId || mod.CourseId || mod.CourseID || mod.CourseId;
    return students.filter((s) => {
      const sCourse = s.courseId || s.CourseId || s.CourseID || s.CourseId;
      return sCourse && sCourse.toString() === (courseId || "").toString();
    });
  })();

  // Derived counts for metrics
  const totalCourses = courses.length;
  const totalModules = modules.length;
  const totalTasks = tasks.length;

  // page-level inline style to match admin colours/layout
  const pageStyle = `
    .app-topbar { background: #fff; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .search-input { min-width: 360px; }
  `;

  return (
    <>
      <style>{pageStyle}</style>
      <Container fluid className="p-0">
        {/* Topbar */}
        <div className="app-topbar p-2 d-flex align-items-center justify-content-between px-3">
          <div className="d-flex align-items-center gap-3">
            <Button
              variant="link"
              className="p-0"
              style={{ fontSize: 20, color: "#6f42c1" }}
            >
              ☰
            </Button>
            <div className="d-flex align-items-center">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "#6f42c1",
                }}
              />
              <div
                className="ms-2 fw-bold"
                style={{ color: "#6f42c1" }}
              >
                Educore
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <InputGroup className="me-3 search-input">
              <Form.Control
                placeholder="Search tasks, modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                variant="primary"
                onClick={() => {
                  /* keep search local */
                }}
              >
                Search
              </Button>
            </InputGroup>

            <div className="d-flex align-items-center gap-3">
              <div style={{ fontSize: 18, color: "#6c757d" }}>🌙</div>
              <div style={{ fontSize: 18, color: "#6c757d" }}>🔔</div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#dee2e6",
                }}
              />
            </div>
          </div>
        </div>

        <Row className="g-0">
          <Col lg={2} className="pe-0">
            <Sidebar active={active} setActive={setActive} />
          </Col>

          <Col lg={10} className="p-4">
            {/* Metrics */}
            <Row className="mb-3">
              <Col md={3}>
                <SummaryCard
                  title="Courses"
                  value={totalCourses}
                  subtitle="Active courses"
                  bg="linear-gradient(90deg, #5b8def, #4aa0ff)"
                  icon="📚"
                />
              </Col>
              <Col md={3}>
                <SummaryCard
                  title="Modules"
                  value={totalModules}
                  subtitle="Assigned modules"
                  bg="linear-gradient(90deg, #7b5cf6, #6f42c1)"
                  icon="📦"
                />
              </Col>
              <Col md={3}>
                <SummaryCard
                  title="Tasks"
                  value={totalTasks}
                  subtitle="Pending & upcoming"
                  bg="linear-gradient(90deg, #ffb249, #ff9a2c)"
                  icon="📝"
                />
              </Col>
              <Col md={3}>
                <SummaryCard
                  title="Due Soon"
                  value={tasks.filter((t) => {
                    if (!t.dueDate) return false;
                    const d = new Date(t.dueDate);
                    const diff = (d - new Date()) / (1000 * 60 * 60 * 24);
                    return diff <= 7 && diff >= 0;
                  }).length}
                  subtitle="Next 7 days"
                  bg="linear-gradient(90deg, #ff5f6d, #ffc371)"
                  icon="⏳"
                />
              </Col>
            </Row>

            {/* Main content */}
            <Card className="shadow-sm mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-0">Lecturer Dashboard</h5>
                    <div className="text-muted small">
                      Manage your courses, modules and tasks
                    </div>
                  </div>

                  <div>
                    <Badge bg="secondary" className="me-2">
                      Role: Lecturer
                    </Badge>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setActive("tasks")}
                    >
                      View Tasks
                    </Button>
                  </div>
                </div>

                {/* Courses & Modules summary */}
                {active === "dashboard" && (
                  <Row>
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Header>
                          <strong>Your Courses</strong>
                        </Card.Header>
                        <Card.Body>
                          {courses.length > 0 ? (
                            <ul className="mb-0">
                              {courses.map((c, i) => <li key={c.courseId || c.id || i}>{c.name}</li>)}
                            </ul>
                          ) : (
                            <div className="text-muted">No courses assigned</div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Header>
                          <strong>Your Modules</strong>
                        </Card.Header>
                        <Card.Body>
                          {modules.length > 0 ? (
                            <ul className="mb-0">
                              {modules.map((m, i) => <li key={m.moduleId || m.id || i}>{m.name}</li>)}
                            </ul>
                          ) : (
                            <div className="text-muted">No modules assigned</div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}

                {/* Courses view */}
                {active === "courses" && (
                  <div>
                    <h6>Courses</h6>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.length > 0 ? (
                          courses.map((c, i) => (
                            <tr key={c.courseId || c.id || i}>
                              <td>{i + 1}</td>
                              <td>{c.name}</td>
                              <td>{c.code || c.courseCode || "—"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-muted">
                              No courses assigned
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}

                {/* Modules view */}
                {active === "modules" && (
                  <div>
                    <h6>Modules</h6>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Course</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modules.length > 0 ? (
                          modules.map((m, i) => (
                            <tr key={m.moduleId || m.id || i}>
                              <td>{i + 1}</td>
                              <td>{m.name}</td>
                              <td>{m.moduleCode || m.code || "—"}</td>
                              <td>{(courses.find(c => (c.courseId === m.courseId || c.id === m.courseId)) || {}).name || "—"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-muted">
                              No modules assigned
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}

                {/* Tasks view (default to tasks when active) */}
                {active === "tasks" && (
                  <>
                    <div className="mb-3 d-flex gap-2">
                      <InputGroup style={{ maxWidth: 520 }}>
                        <Form.Control
                          placeholder="Filter tasks by name"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                          variant="primary"
                          onClick={() => {
                            /* kept for UI parity */
                          }}
                        >
                          Search
                        </Button>
                      </InputGroup>

                      <div className="ms-auto d-flex gap-2">
                        <Button
                          onClick={() => {
                            clearTaskForm();
                            setActive("tasks");
                          }}
                        >
                          New Task
                        </Button>
                      </div>
                    </div>

                    <Card className="mb-3">
                      <Card.Header>
                        <strong>Create Task</strong>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Row className="g-2 align-items-center">
                            <Col md={4}>
                              <Form.Control
                                type="text"
                                placeholder="Task name"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Control
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Select
                                value={selectedModule}
                                onChange={(e) => {
                                  setSelectedModule(e.target.value);
                                  setSelectedStudents([]); // reset selected students when module changes
                                }}
                              >
                                <option value="">Select module</option>
                                {modules.map((m, i) => (
                                  <option key={m.moduleId || m.id || i} value={m.moduleId || m.id}>
                                    {m.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Col>
                            <Col md={2}>
                              <Button onClick={handleAddTask}>Add Task</Button>
                            </Col>

                            {/* Students multi-select for chosen module */}
                            <Col md={12} className="mt-2">
                              <Form.Label>Assign to students (within selected module's course)</Form.Label>
                              <Form.Select
                                multiple
                                value={selectedStudents}
                                onChange={(e) => {
                                  const options = Array.from(e.target.selectedOptions).map(o => o.value);
                                  setSelectedStudents(options);
                                }}
                              >
                                {studentsForSelectedModule.length > 0 ? (
                                  studentsForSelectedModule.map((s) => (
                                    <option key={s.studentId || s.id} value={s.studentId || s.id}>
                                      {s.name} {s.surname} ({s.studentNumber || "—"})
                                    </option>
                                  ))
                                ) : (
                                  <option disabled>No students available for selected module</option>
                                )}
                              </Form.Select>
                              {/* show small action buttons for selected students */}
                              <div className="mt-2">
                                {selectedStudents.length > 0 ? (
                                  selectedStudents.map(id => {
                                    const s = students.find(st => (st.studentId || st.id) === id) || { name: id, surname: '' };
                                    return (
                                      <div key={id} className="d-inline-block me-2 mb-1" style={{ padding: 6, border: '1px solid #e9ecef', borderRadius: 6 }}>
                                        <small>{s.name} {s.surname}</small>
                                        <div>
                                          <Button size="sm" variant="link" onClick={() => openEditStudentModal(id)}>Edit</Button>
                                          <Button size="sm" variant="link" className="text-danger" onClick={() => handleDeleteStudent(id)}>Delete</Button>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="small text-muted">No students selected</div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        </Form>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Header>
                        <strong>Tasks</strong>
                      </Card.Header>
                      <Card.Body>
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Task ID</th>
                              <th>Task</th>
                              <th>Due</th>
                              <th>Module</th>
                              <th>Students</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tasks &&
                            tasks.filter((t) =>
                              search
                                ? (t.taskName || "").toLowerCase().includes(search.toLowerCase())
                                : true
                            ).length > 0 ? (
                              tasks
                                .filter((t) =>
                                  search
                                    ? (t.taskName || "").toLowerCase().includes(search.toLowerCase())
                                    : true
                                )
                                .map((t, i) => {
                                  const studentNames = (t.studentIds || t.assignedStudentIds || []).map(id => {
                                    const s = students.find(st => (st.studentId || st.id) === id);
                                    return s ? `${s.name} ${s.surname}` : id;
                                  }).join(", ");
                                  const moduleName = t.moduleName || modules.find(m => (m.moduleId || m.id) === t.moduleId)?.name || "—";
                                  return (
                                    <tr key={t.taskId || t.id || i}>
                                      <td>{i + 1}</td>
                                      <td>{t.taskId || t.id || `task-${i+1}`}</td>
                                      <td>{t.taskName}</td>
                                      <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                                      <td>{moduleName}</td>
                                      <td>{studentNames || "—"}</td>
                                    </tr>
                                  );
                                })
                            ) : (
                              <tr>
                                <td colSpan="6" className="text-center text-muted">
                                  No tasks created
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </>
                )}
              </Card.Body>
            </Card>

            <Row>
              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <h6 className="mb-2">Quick Actions</h6>
                    <div className="d-flex justify-content-between">
                      <div>Courses</div>
                      <Badge bg="info">{totalCourses}</Badge>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <div>Modules</div>
                      <Badge bg="info">{totalModules}</Badge>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <Button
                        variant="outline-primary"
                        onClick={() => setActive("courses")}
                      >
                        Go to Courses
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setActive("modules")}
                      >
                        Go to Modules
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <h6 className="mb-2">Reports</h6>
                    <div className="small text-muted">
                      Recent activity and quick stats will appear here.
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
      {/* Edit Student Modal */}
      <Modal show={showEditStudentModal} onHide={closeEditStudentModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2"><Form.Label>Student Number</Form.Label><Form.Control value={editingStudentForm.studentNumber} onChange={e => setEditingStudentForm(prev => ({ ...prev, studentNumber: e.target.value }))} /></Form.Group>
            <Form.Group className="mb-2"><Form.Label>First Name</Form.Label><Form.Control value={editingStudentForm.name} onChange={e => setEditingStudentForm(prev => ({ ...prev, name: e.target.value }))} /></Form.Group>
            <Form.Group className="mb-2"><Form.Label>Last Name</Form.Label><Form.Control value={editingStudentForm.surname} onChange={e => setEditingStudentForm(prev => ({ ...prev, surname: e.target.value }))} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditStudentModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveStudentEdit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LECTURER;
