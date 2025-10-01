import nodemailer from 'nodemailer';
import 'dotenv/config';

// This function generates a beautiful HTML table for the order items
const generateItemsTable = (items) => {
    let rows = '';
    items.forEach(item => {
        rows += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; text-align: left;">${item.name}</td>
                <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `;
    });
    return rows;
};

// Main function to send the email
export const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
    // 1. Create a transporter using your Gmail App Password
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Define the email's HTML content
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h1 style="color: #ff9900; text-align: center;">Shophub Order Confirmed!</h1>
            <p>Hi ${userName},</p>
            <p>Thank you for your order! We've received it and will process it shortly. Here are the details:</p>
            
            <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Order #${order._id.toString().slice(-8)}</h3>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead style="background-color: #f2f2f2;">
                    <tr>
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: center;">Quantity</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                        <th style="padding: 10px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateItemsTable(order.items)}
                </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px;">
                <p style="font-size: 1.2em;"><strong>Grand Total: ₹${order.totalAmount.toFixed(2)}</strong></p>
            </div>

            <p style="margin-top: 30px;">Thanks again for shopping with us!</p>
            <p style="text-align: center; font-size: 0.8em; color: #aaa; margin-top: 40px;">
                This is an automated email. Please do not reply.
            </p>
        </div>
    `;

    // 3. Define email options
    const mailOptions = {
        from: `"Shophub" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Your Shophub Order #${order._id.toString().slice(-8)} is Confirmed!`,
        html: emailHtml,
    };

    // 4. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent successfully to ${userEmail}`);
};
