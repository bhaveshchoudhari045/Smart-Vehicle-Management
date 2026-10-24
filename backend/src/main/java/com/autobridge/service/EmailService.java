
package com.autobridge.service;

import com.autobridge.model.Enquiry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendConfirmation(Enquiry enquiry) {
        String subject = "AutoBridge Lite - Enquiry Received";

        String body = "Hello " + enquiry.getCustomer().getFullName() + ",\n\n"
                + "Your enquiry has been received successfully.\n\n"
                + "Vehicle: " + enquiry.getVehicle().getBrand()
                + " " + enquiry.getVehicle().getModel() + "\n"
                + "Enquiry Type: " + enquiry.getType() + "\n"
                + "Current Status: " + enquiry.getStatus() + "\n\n"
                + "The showroom will review your enquiry and update you.\n\n"
                + "Regards,\nAutoBridge Lite Team";

        sendEmail(enquiry.getCustomer().getEmail(), subject, body);
    }

    public void sendStatusUpdate(Enquiry enquiry) {
        String subject = "AutoBridge Lite - Enquiry Status Update";

        String body = "Hello " + enquiry.getCustomer().getFullName() + ",\n\n"
                + "Your enquiry has been updated.\n\n"
                + "Vehicle: " + enquiry.getVehicle().getBrand()
                + " " + enquiry.getVehicle().getModel() + "\n"
                + "Status: " + enquiry.getStatus() + "\n\n"
                + "Availability: " + enquiry.getAvailability() + "\n"
                + "Showroom Response: "
                + (enquiry.getShowroomResponse() == null
                   ? "No additional message" : enquiry.getShowroomResponse())
                + "\nExpected Waiting Time: "
                + (enquiry.getExpectedWait() == null
                   ? "Not specified" : enquiry.getExpectedWait())
                + "\n\nRegards,\nAutoBridge Lite Team";

        sendEmail(enquiry.getCustomer().getEmail(), subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);

        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
