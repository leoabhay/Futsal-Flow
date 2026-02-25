const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Booking = require("../models/Booking");
const User = require("../models/User");

// Send reminder email
const sendReminder = async (booking) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: '"Futsal Flow" <noreply@futsalflow.com>',
    to: booking.user.email,
    subject: "Upcoming Futsal Match Reminder",
    text: `Hi ${booking.user.name}, your match at ${booking.futsal.name} is scheduled for tomorrow at ${booking.startTime}. Get ready!`,
  });
};

// Run every hour
const initReminderCron = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("Running reminder cron job...");
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // Find bookings happening in exactly 24 hours (simplified logic)
    const bookings = await Booking.find({
      date: {
        $gte: new Date(oneDayFromNow.setHours(0, 0, 0, 0)),
        $lt: new Date(oneDayFromNow.setHours(23, 59, 59, 999)),
      },
      status: "confirmed",
    }).populate("user futsal");

    for (const booking of bookings) {
      try {
        await sendReminder(booking);
        console.log(`Reminder sent for booking: ${booking._id}`);
      } catch (err) {
        console.error(
          `Error sending reminder for booking ${booking._id}:`,
          err,
        );
      }
    }
  });
};

module.exports = initReminderCron;