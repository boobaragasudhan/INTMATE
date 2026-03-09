import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ParticleBackground } from './components/ParticleBackground';
import { VintageCard } from './components/VintageCard';
import { RealTimeTicker } from './components/RealTimeTicker';
import api from './services/api';

function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { data } = await api.post('/auth/login', { email, password });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                const { data } = await api.post('/auth/register', { fullName, email, password });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication Failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <VintageCard className="max-w-md w-full">
                <h1 className="text-4xl font-bold text-center mb-6 uppercase tracking-[0.2em] border-b-2 border-vintage-paper pb-4">
                    INTMATE
                </h1>
                <p className="text-vintage-gray text-center mb-8 uppercase text-sm tracking-widest font-bold">
                    [ Automatic Broadcast System ]
                </p>

                {error && <p className="bg-white text-black p-2 mb-4 font-bold text-sm uppercase text-center border-l-4 border-black">ERROR: {error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm uppercase font-bold tracking-wider">
                    {!isLogin && (
                        <div className="flex flex-col">
                            <label className="mb-2 text-vintage-gray">Subject Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-vintage-gray focus:border-vintage-paper outline-none px-2 py-2 text-vintage-paper transition-all"
                                required
                            />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <label className="mb-2 text-vintage-gray">Identification (Email)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-vintage-gray focus:border-vintage-paper outline-none px-2 py-2 text-vintage-paper transition-all"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 text-vintage-gray">Security Clearance (Pass)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-vintage-gray focus:border-vintage-paper outline-none px-2 py-2 text-vintage-paper transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-vintage-paper text-vintage-ink font-bold uppercase tracking-widest py-4 mt-6 hover:bg-white transition-colors cursor-pointer border-2 border-vintage-paper disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Initiate Link' : 'Register Subject')}
                    </button>
                </form>

                <p className="text-center text-xs tracking-widest text-vintage-gray mt-8 cursor-pointer hover:text-white transition-colors uppercase border-t border-vintage-gray/30 pt-4" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "[ Request Clearance ]" : "[ Abort Registration ]"}
                </p>
            </VintageCard>
        </div>
    );
}

function Dashboard({ noiseEnabled, setNoiseEnabled }) {
    const navigate = useNavigate();

    let user = {};
    try {
        const stored = localStorage.getItem('user');
        if (stored && stored !== 'undefined') user = JSON.parse(stored);
    } catch (e) { console.error("Could not parse user."); }

    // Form state
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // Companies state
    const [companies, setCompanies] = useState([]);
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedCompanyIds, setSelectedCompanyIds] = useState(new Set());

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const { data } = await api.get('/broadcast/companies');
            setCompanies(data.data);
            setSelectedCompanyIds(new Set(data.data.map(c => c._id)));
        } catch (e) {
            console.error("Failed to load companies network.", e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleSeed = async () => {
        try {
            await api.post('/broadcast/seed');
            fetchCompanies();
            setStatus('DATABASE OVERRIDDEN: Indian Tech Sector 100+ Seeded!');
        } catch (e) {
            console.error(e);
            alert('Seed failed.');
        }
    }

    const toggleCompanySelect = (id) => {
        const newSet = new Set(selectedCompanyIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedCompanyIds(newSet);
    }

    const selectFiltered = () => {
        const visibleIds = companies.filter(c => filterCategory === 'All' || c.category === filterCategory).map(c => c._id);
        setSelectedCompanyIds(new Set(visibleIds));
    }

    const filteredCompanies = companies.filter(c => filterCategory === 'All' || c.category === filterCategory);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!file) return setStatus('ERROR: NO RESUME DETECTED.');
        if (!summary) return setStatus('ERROR: SUMMARY TEXT REQUIRED.');
        if (selectedCompanyIds.size === 0) return setStatus('ERROR: NO TARGETS SELECTED.');

        setLoading(true);
        setStatus(`UPLOADING & DISPATCHING TO ${selectedCompanyIds.size} CORPORATIONS...`);

        const formData = new FormData();
        formData.append('resumeDocument', file);
        formData.append('summary', summary);
        formData.append('companyIds', JSON.stringify(Array.from(selectedCompanyIds)));

        try {
            const { data } = await api.post('/broadcast/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus(`TRANSMISSION COMPLETE. ${data.stats.attempted} MAILS ATTEMPTED, ${data.stats.successfulDeliveries} DELIVERED.`);
        } catch (err) {
            setStatus('TRANSMISSION FAILED: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen z-10 relative font-sans text-vintage-paper pb-8">
            <RealTimeTicker />

            <div className="max-w-7xl mx-auto flex justify-between items-end border-b-2 border-vintage-paper pb-6 mb-8 px-8">
                <div>
                    <h1 className="text-5xl font-bold uppercase tracking-[0.2em] md:text-5xl text-3xl">Global Mainframe</h1>
                    <p className="text-vintage-gray uppercase tracking-widest text-sm mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Operator: {user.fullName || 'Unknown'} | Connection: SECURE
                    </p>
                </div>
                <div className="flex gap-4 flex-col lg:flex-row lg:items-center">
                    <button onClick={() => setNoiseEnabled(!noiseEnabled)} className="text-[10px] font-bold tracking-widest uppercase border border-vintage-gray/50 text-vintage-gray px-2 py-1 hover:text-white transition-colors">
                        [ Toggle Noise: {noiseEnabled ? 'ON' : 'OFF'} ]
                    </button>
                    <button onClick={handleSeed} className="text-xs font-bold tracking-widest uppercase border-2 border-vintage-gray text-vintage-gray px-4 py-2 hover:bg-vintage-gray hover:text-black transition-colors hidden lg:block">
                        Dev: Seed Network
                    </button>
                    <button onClick={handleLogout} className="text-sm font-bold tracking-widest uppercase border-2 border-vintage-paper text-vintage-paper px-6 py-2 hover:bg-vintage-paper hover:text-black transition-colors">
                        Disconnect
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Left Panel: Operator Resume & Pitch */}
                <div className="w-full lg:w-1/2 flex flex-col gap-8">
                    <VintageCard>
                        <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 border-b border-vintage-gray/30 pb-4">Operator Dossier</h2>
                        <form id="broadcast-form" onSubmit={handleBroadcast} className="flex flex-col gap-6">

                            <div>
                                <label className="block text-vintage-gray uppercase text-sm font-bold tracking-widest mb-2">1. Upload CV (PDF)</label>
                                <div className="border-2 border-dashed border-vintage-gray p-6 text-center hover:border-vintage-paper transition-colors">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setFile(e.target[0] || e.target.files[0])}
                                        className="block w-full text-sm text-vintage-paper file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-vintage-paper file:text-black file:uppercase file:font-bold file:tracking-widest cursor-pointer file:cursor-pointer hover:file:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-vintage-gray uppercase text-sm font-bold tracking-widest mb-2">2. Cover Letter Context / Summary</label>
                                <p className="text-xs text-vintage-gray mb-3 pb-2 border-b border-vintage-gray/20">Write a brief pitch about yourself. The mainframe will automatically structure this into a formal email.</p>
                                <textarea
                                    className="w-full bg-transparent border-2 border-vintage-gray text-vintage-paper p-4 outline-none focus:border-vintage-paper transition-all resize-none min-h-[200px]"
                                    placeholder="I am a highly motivated computer science student currently specializing in frontend systems. Looking for a 6 month internship to apply my skills..."
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                ></textarea>
                            </div>

                            {status && (
                                <div className="bg-black text-green-400 p-4 font-mono text-sm border border-green-400/30 uppercase tracking-widest">
                                    &gt; {status}
                                </div>
                            )}

                        </form>
                    </VintageCard>
                </div>

                {/* Right Panel: Target Network Selector */}
                <div className="w-full lg:w-1/2 flex flex-col h-full">
                    <VintageCard className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center border-b border-vintage-gray/30 pb-4 mb-4">
                            <h2 className="text-2xl font-bold uppercase tracking-widest">Target Selection</h2>
                            <span className="bg-white text-black px-2 py-1 font-bold text-xs">{selectedCompanyIds.size} / {companies.length} SELECTED</span>
                        </div>

                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {['All', 'Startup', 'Product', 'Service', 'Mixed'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-4 py-1 text-xs font-bold uppercase border-2 tracking-wider ${filterCategory === cat ? 'bg-vintage-paper text-vintage-dark border-vintage-paper' : 'border-vintage-gray text-vintage-gray hover:border-vintage-paper hover:text-vintage-paper'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <p className="text-vintage-gray text-xs uppercase tracking-widest">Select manually or use bulk actions</p>
                            <button onClick={selectFiltered} className="text-xs border border-vintage-paper px-3 py-1 hover:bg-vintage-paper hover:text-black">
                                Select Current View
                            </button>
                        </div>

                        {/* Company list */}
                        <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto border-2 border-vintage-gray p-2 custom-scrollbar">
                            {filteredCompanies.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-vintage-gray uppercase tracking-widest text-sm">No targets available in database.</div>
                            ) : (
                                filteredCompanies.map(c => (
                                    <div key={c._id} className={`flex items-center justify-between p-3 mb-2 border hover:border-vintage-paper cursor-pointer transition-colors ${selectedCompanyIds.has(c._id) ? 'border-vintage-paper bg-vintage-paper/5' : 'border-vintage-gray/30'}`} onClick={() => toggleCompanySelect(c._id)}>
                                        <div>
                                            <p className="font-bold text-lg flex items-center gap-3">
                                                {c.name}
                                                {c.linkedinUrl && (
                                                    <a
                                                        href={c.linkedinUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-[10px] bg-vintage-paper text-vintage-dark px-2 rounded-sm tracking-widest hover:bg-white hover:text-black transition-colors"
                                                    >
                                                        [ LINKEDIN ]
                                                    </a>
                                                )}
                                            </p>
                                            <p className="text-xs text-vintage-gray uppercase tracking-widest font-bold mt-1 max-w-[200px] truncate">
                                                {c.internshipTeamEmail ? (
                                                    <span className="text-white border-b border-white border-dashed">🎯 TEAM: {c.internshipTeamEmail.split('@')[0]}@...</span>
                                                ) : (
                                                    <span>{c.email}</span>
                                                )}
                                                &nbsp;|&nbsp;{c.location}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] uppercase tracking-widest border border-vintage-gray px-2 py-1">{c.category}</span>
                                            <div className={`w-4 h-4 border-2 ${selectedCompanyIds.has(c._id) ? 'bg-vintage-paper border-vintage-paper shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'border-vintage-gray'}`}></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Execute Action */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                form="broadcast-form"
                                disabled={loading || !file || !summary || selectedCompanyIds.size === 0}
                                className={`w-full py-5 text-xl font-bold uppercase tracking-[0.3em] border-2 border-vintage-paper transition-all ${loading || !file || !summary || selectedCompanyIds.size === 0 ? 'opacity-50 cursor-not-allowed bg-transparent text-vintage-gray border-vintage-gray' : 'bg-vintage-paper text-vintage-dark hover:bg-white hover:text-black shadow-[0_0_15px_rgba(244,244,240,0.5)] cursor-pointer'}`}
                            >
                                {loading ? 'TRANSMITTING...' : 'EXECUTE BROADCAST'}
                            </button>
                        </div>
                    </VintageCard>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [noiseEnabled, setNoiseEnabled] = useState(true);

    return (
        <Router>
            <ParticleBackground noiseEnabled={noiseEnabled} />
            <Routes>
                <Route path="/" element={<AuthForm />} />
                <Route path="/dashboard" element={<Dashboard noiseEnabled={noiseEnabled} setNoiseEnabled={setNoiseEnabled} />} />
            </Routes>
        </Router>
    );
}

export default App;
