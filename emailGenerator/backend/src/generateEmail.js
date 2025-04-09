import { generateEmailFromPoints } from "./generativeAi.js";
import transporter from "./nodeMailer.js";
import dotenv from "dotenv";
dotenv.config();

export const generateEmail = async (req, res) => {
  try {
    const { bulletPoints, tone, userEmail } = req.body;

    if (!bulletPoints || !tone || !userEmail) {
      return res
        .status(400)
        .json({ error: "Bullet points and tone are required." });
    }

    const email = await generateEmailFromPoints(bulletPoints, tone);

    res.status(200).json({ email });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: userEmail,
      subject: "Welcome to Our Platform",
      text: `Hello\n\nWelcome to our platform! Your email draft is here \n\n ${email}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error.message);
      console.error("Stack Trace:", error.stack);
    }
  } catch (error) {
    console.error("Error generating email:", error.message);
    console.error("Stack Trace:", error.stack); // Add stack trace for debugging
    res.status(500).json({ error: "Failed to generate email." });
  }
};
