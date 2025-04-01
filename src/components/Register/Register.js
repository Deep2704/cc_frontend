import React, { useState } from "react";
import basestyle from "../../css/Base.module.css";
import registerstyle from "./Register.module.css";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: "",
    user_name: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (values) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(values.email)) {
      errors.email = "Invalid email format";
    }
    if (!values.user_name) {
      errors.user_name = "Username is required";
    }
    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formValues);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const response = await axios.post("http://127.0.0.1:5000/register", formValues, {
        headers: { "Content-Type": "application/json" }
      });
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className={registerstyle.register}>
      <form onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        {errorMessage && <p className={basestyle.error}>{errorMessage}</p>}
        <div className={registerstyle.registerInputContainer}>
          <label className={registerstyle.registerLabel}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formValues.email}
            onChange={handleChange}
            className={registerstyle.registerInputField}
          />
          {formErrors.email && <p className={basestyle.error}>{formErrors.email}</p>}
        </div>
        <div className={registerstyle.registerInputContainer}>
          <label className={registerstyle.registerLabel}>Username</label>
          <input
            type="text"
            name="user_name"
            placeholder="Enter your username"
            value={formValues.user_name}
            onChange={handleChange}
            className={registerstyle.registerInputField}
          />
          {formErrors.user_name && <p className={basestyle.error}>{formErrors.user_name}</p>}
        </div>
        <div className={registerstyle.registerInputContainer}>
          <label className={registerstyle.registerLabel}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formValues.password}
            onChange={handleChange}
            className={registerstyle.registerInputField}
          />
          {formErrors.password && <p className={basestyle.error}>{formErrors.password}</p>}
        </div>
        <button type="submit" className={`${basestyle.button_common} ${registerstyle.registerButton}`}>
          Register
        </button>
        <div className={registerstyle.newUser}>
          <span>Already registered?</span>
          <NavLink to="/login" className={registerstyle.signupButton}>
            Login here
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default Register;
