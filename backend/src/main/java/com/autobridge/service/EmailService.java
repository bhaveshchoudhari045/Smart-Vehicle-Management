
package com.autobridge.service;

import com.autobridge.model.Enquiry;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmailService {

    private final Resend resend;

    @Value("${app.mail.from:onboarding@resend.dev}")
    private String fromEmail;

    public EmailService(@Value("${RESEND_API_KEY}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    public void sendConfirmation(Enquiry enquiry) {
        String subject = "AutoBridge Lite | Enquiry Received";

        String body = "Hello " + enquiry.getCustomer().getFullName() + ",\n\n"
                + "Thank you for contacting AutoBridge Lite. Your enquiry has been received.\n\n"
                + "ENQUIRY DETAILS\n"
                + "------------------------------\n"
                + "Vehicle: " + vehicleName(enquiry) + "\n"
                + "Enquiry Type: " + enquiry.getType() + "\n"
                + "Status: " + enquiry.getStatus() + "\n\n"
                + "The showroom will review your request. We will notify you when there is an update.\n\n"
                + "Regards,\nAutoBridge Lite Team";

        sendEmail(enquiry.getCustomer().getEmail(), subject, body);
    }

    public void sendStatusUpdate(Enquiry enquiry) {
        String subject = "AutoBridge Lite | Showroom Response - " + vehicleName(enquiry);

        List<String> lines = new ArrayList<>();
        lines.add("Hello " + enquiry.getCustomer().getFullName() + ",");
        lines.add("");
        lines.add("The showroom has updated your enquiry. Please see the latest details below.");
        lines.add("");
        lines.add("SHOWROOM UPDATE");
        lines.add("------------------------------");
        lines.add("Vehicle: " + vehicleName(enquiry));
        lines.add("Enquiry Type: " + enquiry.getType());
        lines.add("Enquiry Status: " + enquiry.getStatus());

        if (enquiry.getAvailability() != null) {
            lines.add("Vehicle Availability: " + formatAvailability(
                    enquiry.getAvailability().name()));
        }

        if (hasText(enquiry.getShowroomResponse())) {
            lines.add("");
            lines.add("Message from the showroom:");
            lines.add(enquiry.getShowroomResponse().trim());
        }

        if (hasText(enquiry.getExpectedWait())) {
            lines.add("");
            lines.add("Expected Waiting Time: " + enquiry.getExpectedWait().trim());
        }

        lines.add("");
        lines.add("Regards,");
        lines.add("AutoBridge Lite Team");

        sendEmail(
                enquiry.getCustomer().getEmail(),
                subject,
                String.join("\n", lines));
    }

    private String vehicleName(Enquiry enquiry) {
        return enquiry.getVehicle().getBrand() + " "
                + enquiry.getVehicle().getModel();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String formatAvailability(String value) {
        return switch (value) {
            case "AVAILABLE" -> "Available";
            case "WAITING" -> "Waiting";
            case "NOT_AVAILABLE" -> "Not available";
            case "PENDING" -> "Pending confirmation";
            default -> value;
        };
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
