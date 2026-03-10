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
        year: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            setError(err || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12">
            <div className="max-w-md w-full bg-dark-800 p-8 rounded-lg border border-dark-600">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">Join CollegeConnect</h2>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full input-base"
                        placeholder="Full Name"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full input-base"
                        placeholder="student@college.edu"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full input-base"
                        placeholder="Password (min 8 chars, 1 Upper, 1 Lower, 1 Num)"
                        required
                    />
                    <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        className="w-full input-base"
                        placeholder="College Name"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            className="input-base"
                            placeholder="Course (Optional)"
                        />
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="input-base"
                            placeholder="Year (1-6)"
                            min="1"
                            max="6"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn btn-primary mt-4">
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-400">
                    Already have an account? <Link to="/login" className="text-secondary hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
