import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    industry: {
        type: String,
        default: 'Technology',
    },
    category: {
        type: String,
        enum: ['Startup', 'Product', 'Service', 'Mixed'],
        default: 'Mixed',
    },
    location: {
        type: String,
        default: 'India',
    },
    linkedinUrl: {
        type: String,
        default: '',
    },
    internshipTeamEmail: {
        type: String,
        default: '',
    }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
export default Company;
