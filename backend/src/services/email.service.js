import nodemailer from 'nodemailer';

export const sendResumeBroadcast = async (user, fileBuffer, fileName, summary, companies) => {
    let authAccount = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    };

    if (!process.env.SMTP_USER) {
        const testAccount = await nodemailer.createTestAccount();
        authAccount.user = testAccount.user;
        authAccount.pass = testAccount.pass;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        secure: true, // Use standard SSL/TLS since Gmail requires port 465 true
        auth: {
            user: authAccount.user,
            pass: authAccount.pass
        }
    });

    const promises = companies.map((company) => {
        const targetEmail = company.internshipTeamEmail || company.email;

        const mailOptions = {
            from: `"${user.fullName} via INTMATE" <${authAccount.user}>`,
            replyTo: user.email,
            to: targetEmail,
            subject: `Application for Internship - ${user.fullName}`,
            text: `Dear Hiring Manager at ${company.name},\n\nI am reaching out to express my interest in joining your team for a technical internship. Below is a brief summary of my background:\n\n${summary}\n\nPlease find my resume attached. I would love the opportunity to contribute to ${company.name}.\n\nBest regards,\n${user.fullName}\n${user.email}`,
            attachments: [
                {
                    filename: fileName,
                    content: fileBuffer
                }
            ]
        };
        return transporter.sendMail(mailOptions).catch(err => {
            console.error(`Failed to send email to ${company.name}:`, err.message);
            return null;
        });
    });

    const results = await Promise.all(promises);
    const successfulSends = results.filter(r => r !== null).length;

    if (successfulSends > 0 && !process.env.SMTP_USER) {
        console.log("-----------------------------------------");
        console.log(`Email Transmitted to Test Server! Previewing ${successfulSends} emails:`);
        results.filter(r => r !== null).forEach((r, index) => {
            console.log(`[Target ${index + 1}] Preview: ` + nodemailer.getTestMessageUrl(r));
        });
        console.log("-----------------------------------------");
    }

    return {
        attempted: companies.length,
        successful: successfulSends
    };
};
