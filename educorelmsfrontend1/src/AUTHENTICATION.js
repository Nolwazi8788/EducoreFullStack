import React, { useState } from "react";
import {
    Form,
    Button,
    Container,
    Row,
    Col,
    Card,
    Alert,
} from "react-bootstrap";
import axios from "axios";
import bg from "./assets/photo-1432821596592-e2c18b78144f.jpeg"; // add near top with other imports

// If a token is already stored (page reload), ensure axios sends it
const existingToken = localStorage.getItem("token") || sessionStorage.getItem("token");
if (existingToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

const AuthPage = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showRoleSelection, setShowRoleSelection] = useState(false);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- Student-specific fields ---
    const [studentNumber, setStudentNumber] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    // === LOGIN HANDLER ===
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
                const response = await axios.post("https://localhost:7281/api/Authentication/Login", {
                    email,
                    password,
                });

                if (response.data && response.data.status === "Success") {
                    // try to extract token from common fields
                    const token = response.data?.token || response.data?.accessToken || response.data?.access_token || response.data?.data?.token || response.data?.data?.accessToken || null;
                    if (token) {
                        localStorage.setItem("token", token);
                        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
                    }

                    // Get user role and user info after successful login
                    const userResponse = await axios.get("https://localhost:7281/api/Authentication/Users");
                    const users = userResponse.data || [];
                    const currentUser = users.find(user => (user.email || user.emailAddress) === email);

                    if (currentUser) {
                        const userRole = (currentUser.roles && currentUser.roles[0]) || currentUser.role || "User";
                        localStorage.setItem("role", userRole);
                        // store whole user object for later use (student id etc.)
                        try { localStorage.setItem("user", JSON.stringify(currentUser)); } catch (e) { }
                        onLoginSuccess(userRole);
                    } else {
                        setError("User information not found.");
                    }
                } else {
                    setError(response.data?.message || "Login failed. Please try again.");
                }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) setError("Invalid email or password.");
                else if (error.response.status === 404) setError("User not found. Please register first.");
                else setError(error.response.data?.message || "Login failed. Please try again.");
            } else {
                setError("Unable to connect to the server. Check your backend is running.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // === REGISTER HANDLER ===
    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation
        if (role === "Student") {
            if (!studentNumber || !name || !surname || !gender || !dob || !address || !email || !password || !confirmPassword) {
                setError("Please fill in all required fields for Student.");
                return;
            }
        } else {
            if (!username || !email || !password || !confirmPassword) {
                setError("Please fill in all required fields.");
                return;
            }
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");

        let userData = {};
        let apiUrl = "";

        if (role === "Student") {
            userData = {
                studentNumber: studentNumber,
                name: name,
                surname: surname,
                gender: gender,
                dateOfBirth: new Date(dob).toISOString(), // send ISO string
                homeAddress: address,
                emailAddress: email, // backend expects EmailAddress for student
                phoneNumber: phone || null,
                password: password,
                confirmPassword: confirmPassword
            };
            apiUrl = "https://localhost:7281/api/Authentication/RegisterStudent";
        } else {
            userData = {
                username: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            };
            apiUrl = `https://localhost:7281/api/Authentication/Register?role=${role}`;
        }

        try {
            const response = await axios.post(apiUrl, userData);

            if (response.data && response.data.status === "Success") {
                alert(`Registration successful as ${role}`);
                // Reset all fields
                resetForm();
                setIsLogin(true);
                setShowRoleSelection(false);
            } else {
                setError(response.data?.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data?.message || "Registration failed. Please try again.");
            } else {
                setError("Unable to connect to the server. Check your backend is running.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form function
    const resetForm = () => {
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("");
        setStudentNumber("");
        setName("");
        setSurname("");
        setGender("");
        setDob("");
        setAddress("");
        setPhone("");
        setError("");
    };

    // === ROLE SELECTION HANDLER ===
    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setShowRoleSelection(false);
        setIsLogin(false);
        resetForm();
        setRole(selectedRole);
    };

    // Switch to login
    const switchToLogin = () => {
        setIsLogin(true);
        setShowRoleSelection(false);
        resetForm();
    };

    // Switch to role selection
    const switchToRoleSelection = () => {
        setShowRoleSelection(true);
        setIsLogin(false);
        resetForm();
    };

const bgStyle = {
  /* dark overlay + background image (imported from src/assets/) */
  backgroundImage: `linear-gradient(rgba(17,24,39,0.45), rgba(17,24,39,0.45)), url(${bg})`,
  backgroundSize: "cover",
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
  backgroundColor: "#111827" // fallback color
};

    return (
        <div style={bgStyle}>
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={8} md={6} lg={4}>
                        <Card
                            className="shadow p-4"
                            style={{
                                borderRadius: "15px",
                                backgroundColor: "rgba(255,255,255,0.95)",
                            }}
                        >
                            {showRoleSelection ? (
                                <>
                                    <h3 className="text-center mb-4">Choose Your Role</h3>
                                    <Button
                                        variant="outline-primary"
                                        className="w-100 mb-3"
                                        onClick={() => handleRoleSelect("Admin")}
                                    >
                                        Admin
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        className="w-100 mb-3"
                                        onClick={() => handleRoleSelect("Lecturer")}
                                    >
                                        Lecturer
                                    </Button>
                                    <Button
                                        variant="outline-warning"
                                        className="w-100 mb-3"
                                        onClick={() => handleRoleSelect("Student")}
                                    >
                                        Student
                                    </Button>
                                    <div className="text-center">
                                        <small>
                                            Already have an account?{" "}
                                            <span
                                                style={{ color: "#007bff", cursor: "pointer" }}
                                                onClick={switchToLogin}
                                            >
                                                Log in
                                            </span>
                                        </small>
                                    </div>
                                </>
                            ) : isLogin ? (
                                <>
                                    <h3 className="text-center mb-4">Log in to Portal</h3>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <Form onSubmit={handleLogin}>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="email"
                                                placeholder="Email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                                required
                                            />
                                        </Form.Group>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="w-100 mb-3"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Logging in..." : "Login"}
                                        </Button>
                                        <div className="text-center">
                                            <small>
                                                Don't have an account?{" "}
                                                <span
                                                    style={{ color: "#007bff", cursor: "pointer" }}
                                                    onClick={switchToRoleSelection}
                                                >
                                                    Sign up
                                                </span>
                                            </small>
                                        </div>
                                    </Form>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-center mb-4">Sign up as {role}</h3>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <Form onSubmit={handleRegister}>
                                        {role === "Student" ? (
                                            <>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Student Number"
                                                        value={studentNumber}
                                                        onChange={(e) => setStudentNumber(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Surname"
                                                        value={surname}
                                                        onChange={(e) => setSurname(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Select
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    >
                                                        <option value="">-- Select Gender --</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                        <option value="Prefer not to say">Prefer not to say</option>
                                                    </Form.Select>
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Date of Birth</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={dob}
                                                        onChange={(e) => setDob(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Home Address"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Email Address"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Phone Number (optional)"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                </Form.Group>
                                            </>
                                        ) : (
                                            <>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Email address"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                </Form.Group>
                                            </>
                                        )}

                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="password"
                                                placeholder="Confirm password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={isLoading}
                                                required
                                            />
                                        </Form.Group>

                                        <Button
                                            variant="success"
                                            type="submit"
                                            className="w-100 mb-3"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Registering..." : `Register as ${role}`}
                                        </Button>

                                        <div className="text-center">
                                            <small>
                                                Already have an account?{" "}
                                                <span
                                                    style={{ color: "#007bff", cursor: "pointer" }}
                                                    onClick={switchToLogin}
                                                >
                                                    Log in
                                                </span>
                                            </small>
                                        </div>
                                    </Form>
                                </>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AuthPage;