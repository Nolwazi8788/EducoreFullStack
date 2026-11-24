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
  Modal,
  Badge,
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

const Sidebar = ({ onNavigate }) => (
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
        <div className="small text-muted">Student</div>
      </div>
    </div>

    <div className="d-flex flex-column">
      <Button
        variant="link"
        className="text-start mb-1"
        onClick={() => onNavigate("dashboard")}
      >
        🏠 Dashboard
      </Button>
      <Button
        variant="link"
        className="text-start mb-1"
        onClick={() => onNavigate("tasks")}
      >
        📝 Tasks
      </Button>
      <Button
        variant="link"
        className="text-start mb-1"
        onClick={() => onNavigate("submissions")}
      >
        📤 Submissions
      </Button>
      <Button
        variant="link"
        className="text-start mb-1"
        onClick={() => onNavigate("grades")}
      >
        📈 Grades
      </Button>
    </div>

    <div className="mt-auto">
      <hr />
      <Button
        variant="outline-danger"
        size="sm"
        className="w-100"
        onClick={() => onNavigate("logout")}
      >
        Logout
      </Button>
    </div>
  </div>
);

const STUDENT = () => {
  const [view, setView] = useState("dashboard");
  // sample static tasks (used as fallback/demo when backend isn't available)
  const SAMPLE_TASKS = [
    { taskId: 't1', taskName: 'Intro to Programming - Assignment 1', moduleId: 'm1', moduleName: 'Intro to Programming', courseName: 'Computer Science', dueDate: '2025-10-24', status: 'Not Started' },
    { taskId: 't2', taskName: 'Data Structures - Quiz 1', moduleId: 'm2', moduleName: 'Data Structures', courseName: 'Computer Science', dueDate: '2025-10-20', status: 'In Progress' },
    { taskId: 't3', taskName: 'Database Design - Lab', moduleId: 'm4', moduleName: 'Database Design', courseName: 'Information Systems', dueDate: '2025-11-02', status: 'Not Started' },
    { taskId: 't4', taskName: 'Calculus I - Problem Set', moduleId: 'm5', moduleName: 'Calculus I', courseName: 'Mathematics', dueDate: '2025-10-18', status: 'Complete' },
    { taskId: 't5', taskName: 'Academic Writing - Essay', moduleId: 'm10', moduleName: 'Academic Writing', courseName: 'English', dueDate: '2025-10-30', status: 'Not Started' }
  ];
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [filterStatus, setFilterStatus] = useState("All");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Student-specific form (submit assignment)
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState(null);
  const [showToast, setShowToast] = useState({
    show: false,
    msg: "",
    variant: "success",
  });

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  const fetchTasks = () => {
    // Use authenticated student id if available
    const storedUserJson = localStorage.getItem("user");
    let studentId = 1;
    try {
      const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
      if (storedUser && (storedUser.studentId || storedUser.id)) studentId = storedUser.studentId || storedUser.id;
    } catch (e) { }

    // ensure axios has token header if present
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    axios
      .get(`https://localhost:7013/api/Task/Student/${studentId}`)
      .then((res) => {
        const remote = res.data || [];
        // if backend returned items, merge/replace; otherwise keep sample tasks
        if (Array.isArray(remote) && remote.length > 0) {
          setTasks(remote);
        } else {
          // keep SAMPLE_TASKS (already set as initial state)
        }
        setFilterStatus("All");
        setModuleFilter("All");
      })
      .catch((err) => {
        console.error(err);
        // leave SAMPLE_TASKS in place
      });
  };

  const handleStatusChange = (taskId, newStatus) => {
    // Optimistic update locally
    setTasks(prev => prev.map(t => (t.taskId === taskId ? { ...t, status: newStatus } : t)));
    setShowToast({ show: true, msg: "Status updated", variant: "success" });

    // send to backend (best-effort)
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    axios.put(`https://localhost:7013/api/Task/UpdateStatus/${taskId}`, { status: newStatus }, config)
      .then(() => {
        // success; nothing more to do (we already updated locally)
        setTimeout(() => setShowToast({ show: false, msg: "", variant: "success" }), 2000);
      })
      .catch((err) => {
        console.error(err);
        // revert change on failure
        setTasks(prev => prev.map(t => (t.taskId === taskId ? { ...t, status: t.status === newStatus ? 'Not Started' : t.status } : t)));
        setShowToast({ show: true, msg: "Update failed", variant: "danger" });
        setTimeout(() => setShowToast({ show: false, msg: "", variant: "success" }), 2000);
      });
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setShowToast({
        show: true,
        msg: "Select a task to submit",
        variant: "danger",
      });
      setTimeout(
        () => setShowToast({ show: false, msg: "", variant: "success" }),
        2000
      );
      return;
    }

    // Simulate upload — replace with real API (multipart/form-data) if available
    const payload = {
      taskId: selectedTaskId,
      text: submissionText,
      fileName: file ? file.name : null,
      studentId: (function(){
        try { const u = JSON.parse(localStorage.getItem('user')||'null'); return u && (u.studentId||u.id) ? (u.studentId||u.id) : 1; } catch(e){ return 1 }
      })(),
    };

    axios
      .post("https://localhost:7013/api/Submission", payload)
      .then(() => {
        setShowToast({
          show: true,
          msg: "Submitted successfully",
          variant: "success",
        });
        setSubmissionText("");
        setFile(null);
        fetchTasks();
        setTimeout(
          () => setShowToast({ show: false, msg: "", variant: "success" }),
          2500
        );
      })
      .catch((err) => {
        console.error(err);
        setShowToast({
          show: true,
          msg: "Submission failed",
          variant: "danger",
        });
        setTimeout(
          () => setShowToast({ show: false, msg: "", variant: "success" }),
          2500
        );
      });
  };

  // derive modules student is enrolled in from tasks (unique)
  const enrolledModulesMap = {};
  tasks.forEach((t) => {
    const id = (t.moduleId || t.moduleId || t.moduleId || t.moduleId)?.toString();
    if (id) {
      enrolledModulesMap[id] = t.moduleName || enrolledModulesMap[id] || "Module";
    }
  });
  const enrolledModules = Object.entries(enrolledModulesMap).map(([id, name]) => ({
    moduleId: id,
    moduleName: name,
  }));

  // filter tasks by status, module and search
  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === "All" || task.status === filterStatus;
    const moduleId = (task.moduleId || task.moduleId || "").toString();
    const moduleMatch = moduleFilter === "All" || moduleId === moduleFilter.toString();
    const searchMatch =
      (task.taskName || "").toLowerCase().includes(search.toLowerCase()) ||
      (task.moduleName || "").toLowerCase().includes(search.toLowerCase());
    return statusMatch && moduleMatch && searchMatch;
  });

  const upcomingCount = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const diff = (new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  // small styling to match admin/lecturer
  const pageStyle = `
    .app-topbar { background: #fff; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .sidebar { background: #f8fafc; }
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
            <InputGroup className="me-3" style={{ minWidth: 360 }}>
              <Form.Control
                placeholder="Search tasks or modules..."
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
            <Sidebar
              onNavigate={(v) => {
                if (v === "logout") setShowLogoutModal(true);
                else setView(v);
              }}
            />
          </Col>

          <Col lg={10} className="p-4">
            <Row className="mb-3">
              <Col md={3}>
                <SummaryCard
                  title="Assigned Tasks"
                  value={tasks.length}
                  subtitle="All tasks"
                  bg="linear-gradient(90deg, #5b8def, #4aa0ff)"
                  icon="📝"
                />
              </Col>
              <Col md={3}>
                <SummaryCard
                  title="Due Soon"
                  value={upcomingCount}
                  subtitle="Next 7 days"
                  bg="linear-gradient(90deg, #ff5f6d, #ffc371)"
                  icon="⏳"
                />
              </Col>
              <Col md={3}>
                <SummaryCard
                  title="Submissions"
                  value={"—"}
                  subtitle="Submitted / Pending"
                  bg="linear-gradient(90deg, #7b5cf6, #6f42c1)"
                  icon="📤"
                />
              </Col>
              <Col md={3}>
                <SummaryCard
                  title="Grades"
                  value={"—"}
                  subtitle="Latest score"
                  bg="linear-gradient(90deg, #ffb249, #ff9a2c)"
                  icon="📈"
                />
              </Col>
            </Row>

            {/* Main content */}
            {view === "dashboard" && (
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="mb-0">Student Dashboard</h5>
                      <div className="text-muted small">
                        Track tasks, submit work and view grades
                      </div>
                    </div>
                    <div>
                      <Badge bg="secondary" className="me-2">
                        Role: Student
                      </Badge>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setView("tasks")}
                      >
                        View Tasks
                      </Button>
                    </div>
                  </div>

                  <Row>
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Header>
                          <strong>Upcoming Tasks</strong>
                        </Card.Header>
                        <Card.Body>
                          {tasks.slice(0, 5).length ? (
                            <ul className="mb-0">
                              {tasks.slice(0, 5).map((t, i) => (
                                <li key={i}>
                                  <strong>{t.taskName}</strong> —{" "}
                                  <small className="text-muted">
                                    {t.moduleName} •{" "}
                                    {t.dueDate
                                      ? new Date(t.dueDate).toLocaleDateString()
                                      : "No due date"}
                                  </small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-muted">No tasks assigned</div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Header>
                          <strong>Quick Submit</strong>
                        </Card.Header>
                        <Card.Body>
                          <Form onSubmit={handleSubmitAssignment}>
                            <Row className="g-2 align-items-center">
                              <Col md={12}>
                                <Form.Select
                                  value={selectedTaskId}
                                  onChange={(e) => setSelectedTaskId(e.target.value)}
                                >
                                  <option value="">Choose task to submit</option>
                                  {tasks.map((t) => (
                                    <option key={t.taskId} value={t.taskId}>
                                      {t.taskName} — {t.moduleName}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Col>
                              <Col md={12}>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  placeholder="Write a short note about your submission (optional)"
                                  value={submissionText}
                                  onChange={(e) => setSubmissionText(e.target.value)}
                                />
                              </Col>
                              <Col md={8}>
                                <Form.Control
                                  type="file"
                                  onChange={(e) => setFile(e.target.files[0])}
                                />
                              </Col>
                              <Col md={4}>
                                <Button type="submit" className="w-100">
                                  Submit
                                </Button>
                              </Col>
                              <Col md={12}>
                                <div className="small text-muted mt-2">
                                  Tip: add a short note and attach your file.
                                  Submissions are timestamped.
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Tasks view */}
            {view === "tasks" && (
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <div className="mb-3 d-flex gap-2">
                    <InputGroup style={{ maxWidth: 520 }}>
                      <Form.Control
                        placeholder="Filter tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <Button
                        variant="primary"
                        onClick={() => {
                          /* UI only */
                        }}
                      >
                        Search
                      </Button>
                    </InputGroup>

                    <div className="ms-auto d-flex gap-2 align-items-center">
                      <Form.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="All">All statuses</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                      </Form.Select>

                      <Form.Select
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                      >
                        <option value="All">All modules</option>
                        {enrolledModules.map((m) => (
                          <option key={m.moduleId} value={m.moduleId}>
                            {m.moduleName}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </div>

                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Task</th>
                        <th>Due</th>
                        <th>Module</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length ? (
                        filteredTasks.map((t, i) => (
                          <tr key={i}>
                            <td>{t.taskId || i + 1}</td>
                            <td>{t.taskName}</td>
                            <td>
                              {t.dueDate
                                ? new Date(t.dueDate).toLocaleDateString()
                                : "—"}
                            </td>
                            <td>{t.moduleName}</td>
                            <td>{t.moduleName}</td>
                            <td>{t.status}</td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={t.status}
                                onChange={(e) =>
                                  handleStatusChange(t.taskId, e.target.value)
                                }
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Complete">Complete</option>
                              </Form.Select>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            No tasks found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* Submissions & Grades placeholders */}
            {view === "submissions" && (
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <h5>My Submissions</h5>
                  <div className="text-muted">
                    All your uploaded submissions will appear here (coming soon).
                  </div>
                </Card.Body>
              </Card>
            )}

            {view === "grades" && (
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <h5>Grades</h5>
                  <div className="text-muted">
                    Your latest grades and feedback will appear here (coming soon).
                  </div>
                </Card.Body>
              </Card>
            )}

            <Row>
              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <h6 className="mb-2">Quick Actions</h6>
                    <div className="d-flex justify-content-between">
                      <div>Open Tasks</div>
                      <Badge bg="info">{tasks.length}</Badge>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <Button
                        variant="outline-primary"
                        onClick={() => setView("tasks")}
                      >
                        Go to Tasks
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setView("grades")}
                      >
                        View Grades
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <h6 className="mb-2">Help & Support</h6>
                    <div className="small text-muted">
                      Need help? Contact your lecturer or the course coordinator.
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>

      {/* small non-blocking toast (simple) */}
      {showToast.show && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 1050,
          }}
        >
          <Card
            bg={showToast.variant === "danger" ? "danger" : "success"}
            text="white"
            style={{ minWidth: 220 }}
          >
            <Card.Body className="py-2">{showToast.msg}</Card.Body>
          </Card>
        </div>
      )}
    </>
  );
};

export default STUDENT;