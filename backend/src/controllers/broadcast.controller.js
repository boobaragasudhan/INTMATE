import Company from '../models/Company.model.js';
import StudentProfile from '../models/StudentProfile.model.js';
import { sendResumeBroadcast } from '../services/email.service.js';

export const getCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({}).sort({ name: 1 });
        res.status(200).json({ success: true, count: companies.length, data: companies });
    } catch (error) {
        next(error);
    }
};

export const broadcastResume = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a valid PDF resume document.');
        }

        const { summary, companyIds } = req.body;

        if (!summary) {
            res.status(400);
            throw new Error('Please provide a summary context for the email body.');
        }

        let selectedCompanyIds = [];
        try {
            selectedCompanyIds = JSON.parse(companyIds);
        } catch (e) {
            selectedCompanyIds = companyIds ? [companyIds] : [];
        }

        if (selectedCompanyIds.length === 0) {
            res.status(400);
            throw new Error('No target companies selected.');
        }

        const companies = await Company.find({ _id: { $in: selectedCompanyIds } });

        if (companies.length === 0) {
            res.status(404);
            throw new Error('Selected companies could not be found in remote network.');
        }

        let profile = await StudentProfile.findOne({ user: req.user._id });
        if (profile) {
            profile.resumeFileName = req.file.originalname;
            profile.resumeFileData = req.file.buffer;
            profile.resumeContentType = req.file.mimetype;
            profile.broadcastStatus = 'Broadcasted';
            await profile.save();
        } else {
            profile = await StudentProfile.create({
                user: req.user._id,
                resumeFileName: req.file.originalname,
                resumeFileData: req.file.buffer,
                resumeContentType: req.file.mimetype,
                broadcastStatus: 'Broadcasted'
            });
        }

        const broadcastResult = await sendResumeBroadcast(req.user, req.file.buffer, req.file.originalname, summary, companies);

        res.status(200).json({
            success: true,
            message: 'Resume directly broadcasted via Internal Mail Server!',
            stats: { successfulDeliveries: broadcastResult.successful, attempted: broadcastResult.attempted }
        });

    } catch (error) {
        next(error);
    }
};

export const seedCompanies = async (req, res, next) => {
    try {
        await Company.deleteMany({});
        const dummyCompanies = [
            { name: "Zoho Corporation", category: "Product", email: "careers@zohocorp.com", location: "Chennai, Tamil Nadu", linkedinUrl: "https://www.linkedin.com/company/zoho", internshipTeamEmail: "internships@zohocorp.com" },
            { name: "Freshworks", category: "Product", email: "talent@freshworks.com", location: "Chennai, Tamil Nadu", linkedinUrl: "https://www.linkedin.com/company/freshworks-inc/posts" },
            { name: "Tata Consultancy Services (TCS)", category: "Service", email: "careers@tcs.com", location: "Mumbai, Maharashtra", linkedinUrl: "https://www.linkedin.com/company/tcs", internshipTeamEmail: "campus.placements@tcs.com" },
            { name: "Infosys", category: "Service", email: "careers@infosys.com", location: "Bangalore, Karnataka" },
            { name: "Wipro", category: "Service", email: "careers@wipro.com", location: "Bangalore, Karnataka", linkedinUrl: "https://www.linkedin.com/company/wipro" },
            { name: "Chargebee", category: "Product", email: "hiring@chargebee.com", location: "Chennai, Tamil Nadu", internshipTeamEmail: "university@chargebee.com" },
            { name: "Kissflow", category: "Product", email: "careers@kissflow.com", location: "Chennai, Tamil Nadu", linkedinUrl: "https://www.linkedin.com/company/kissflow" },
            { name: "Flipkart", category: "Mixed", email: "careers@flipkart.com", location: "Bangalore, Karnataka", internshipTeamEmail: "interns@flipkart.com" },
            { name: "Mad Street Den", category: "Startup", email: "hiring@madstreetden.com", location: "Chennai, Tamil Nadu", linkedinUrl: "https://www.linkedin.com/company/mad-street-den" },
            { name: "Postman", category: "Product", email: "jobs@postman.com", location: "Bangalore, Karnataka", linkedinUrl: "https://www.linkedin.com/company/postman-api-tools" },
            { name: "Zerodha", category: "Product", email: "careers@zerodha.com", location: "Bangalore, Karnataka", internshipTeamEmail: "reach@zerodha.com" },
            { name: "CRED", category: "Startup", email: "careers@cred.club", location: "Bangalore, Karnataka", linkedinUrl: "https://www.linkedin.com/company/credclub", internshipTeamEmail: "campus@cred.club" },
            { name: "Razorpay", category: "Startup", email: "hiring@razorpay.com", location: "Bangalore, Karnataka", linkedinUrl: "https://www.linkedin.com/company/razorpay" },
            { name: "Zomato", category: "Mixed", email: "jobs@zomato.com", location: "Gurugram, Haryana", linkedinUrl: "https://www.linkedin.com/company/zomato", internshipTeamEmail: "hiring-interns@zomato.com" },
            { name: "L&T Technology Services", category: "Service", email: "careers@ltts.com", location: "Vadodara, Gujarat" },
            { name: "Tech Mahindra", category: "Service", email: "careers@techmahindra.com", location: "Pune, Maharashtra", linkedinUrl: "https://www.linkedin.com/company/tech-mahindra" },
            { name: "HCL Technologies", category: "Service", email: "careers@hcl.com", location: "Noida, Uttar Pradesh", internshipTeamEmail: "fresher-talent@hcl.com" },
            { name: "BrowserStack", category: "Product", email: "careers@browserstack.com", location: "Mumbai, Maharashtra", linkedinUrl: "https://www.linkedin.com/company/browserstack" },
            { name: "Ather Energy", category: "Startup", email: "careers@atherenergy.com", location: "Bangalore, Karnataka" },
            { name: "Swiggy", category: "Mixed", email: "careers@swiggy.in", location: "Bangalore, Karnataka", linkedinUrl: "https://www.linkedin.com/company/swiggy1", internshipTeamEmail: "campus.hiring@swiggy.in" }
        ];
        await Company.insertMany(dummyCompanies);
        res.status(201).json({ success: true, message: "20 Indian Tech companies seeded into Database!" });
    } catch (error) {
        next(error);
    }
}
