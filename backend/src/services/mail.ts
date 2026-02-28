import nodemailer from "nodemailer";
import { settings } from "../settings";

export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    const mailOptions = {
      from: settings.smtpUser,
      to: email,
      subject: "Your OTP for Login",
      text: `
Hi there,

Here is your One-Time Password (OTP) to log in to E-WasteLoop:

🔑 OTP: ${otp}

This OTP is valid for the next 5 minutes. Please do not share this code with anyone.

If you did not request this code, please ignore this email or contact us.

Thanks,  
The E-WasteLoop Team  
ewasteloop@gmail.com
  `.trim(),
    };

    await this.transporter.sendMail(mailOptions);
  }
}
