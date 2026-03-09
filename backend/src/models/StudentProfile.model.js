import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    resumeFileName: {
        type: String,
        required: true
    },
    resumeFileData: {
        type: Buffer,
        required: true
    },
    resumeContentType: {
        type: String,
        required: true
    },
    broadcastStatus: {
        type: String,
        default: 'Pending'
    }
}, { timestamps: true });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
