import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        college: '',
        course: '',
        year: '',
        role: 'student',
        graduationYear: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (newRole) => {
        setFormData({ 
            ...formData, 
            role: newRole,
            year: '',
            graduationYear: '' 
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== '')
            );
            await register(payload);
            navigate('/');
        } catch (err) {
            setError(err?.response?.data?.message || err || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12">
            <div className="max-w-md w-full bg-dark-800 p-8 rounded-2xl border border-dark-600 shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
                    <p className="text-gray-400 mt-2 text-sm">Join the CollegeConnect ecosystem</p>
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-dark-700 rounded-full mb-6 border border-dark-600">
                    <button
                        type="button"
                        onClick={() => handleRoleChange('student')}
                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                            formData.role === 'student' 
                            ? 'bg-gray-200 text-dark-900 shadow-md' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleChange('alumni')}
                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                            formData.role === 'alumni' 
                            ? 'bg-gray-200 text-dark-900 shadow-md' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        Alumni
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm flex items-center">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 ml-4 uppercase">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full input-base"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 ml-4 uppercase">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full input-base"
                            placeholder="you@email.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 ml-4 uppercase">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full input-base"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 ml-4 uppercase">College / University</label>
                        <input
                            type="text"
                            name="college"
                            value={formData.college}
                            onChange={handleChange}
                            className="w-full input-base"
                            placeholder="University Name"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 ml-4 uppercase">Course</label>
                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                className="w-full input-base"
                                placeholder="B.Tech, MBA..."
                            />
                        </div>

                        {formData.role === 'student' ? (
                            <div className="space-y-1 transition-all duration-300">
                                <label className="text-xs font-semibold text-gray-500 ml-4 uppercase">Current Year</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full input-base"
                                    placeholder="1-6"
                                    min="1"
                                    max="6"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-1 transition-all duration-300">
                                <label className="text-xs font-semibold text-gray-500 ml-4 uppercase">Graduation Year</label>
                                <input
                                    type="number"
                                    name="graduationYear"
                                    value={formData.graduationYear}
                                    onChange={handleChange}
                                    className="w-full input-base"
                                    placeholder="YYYY"
                                    min="1950"
                                    max={new Date().getFullYear() + 10}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn btn-primary mt-6 py-3 shadow-lg shadow-gray-900/50">
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-dark-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account? <Link to="/login" className="text-white hover:underline font-semibold ml-1">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
