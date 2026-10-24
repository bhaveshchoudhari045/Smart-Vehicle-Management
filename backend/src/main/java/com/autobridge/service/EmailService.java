
package com.autobridge.service;

import com.autobridge.model.Enquiry;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final Resend resend;

    @Value("${app.mail.from:onboarding@resend.dev}")
    private String fromEmail;

    public EmailService(@Value("${RESEND_API_KEY}") String apiKey) {
        this.resend = new Resend(apiKey);
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
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .text(body)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            System.out.println("Resend accepted email to: " + to
                    + ", email ID: " + response.getId());

        } catch (ResendException e) {
            System.err.println("Resend email failed: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected email error: " + e.getMessage());
        }
    }
}
