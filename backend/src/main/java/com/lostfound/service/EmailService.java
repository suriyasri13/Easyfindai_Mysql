package com.lostfound.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;

@Service
public class EmailService {

    @Autowired
    private ApplicationContext context;

    public void sendMatchAlert(String toEmail, String userName, String itemName) {
        try {
            // We use reflection to find the mail sender. 
            // This prevents the whole app from crashing if the library is still downloading.
            Object mailSender = null;
            try {
                mailSender = context.getBean("mailSender");
            } catch (Exception e) {
                System.out.println("DEBUG EMAIL: JavaMailSender not configured or library missing. Email skipped.");
            }

            if (mailSender == null) {
                System.out.println("DEBUG EMAIL (Mock): To: " + toEmail + " | Msg: Hello " + userName + ", we found your " + itemName);
                return;
            }

            // If we found the sender, try to send using reflection
            Class<?> messageClass = Class.forName("org.springframework.mail.SimpleMailMessage");
            Object message = messageClass.getDeclaredConstructor().newInstance();
            
            // Set properties via reflection
            messageClass.getMethod("setFrom", String.class).invoke(message, "no-reply@easefindai.com");
            messageClass.getMethod("setTo", String.class).invoke(message, toEmail);
            messageClass.getMethod("setSubject", String.class).invoke(message, "New Match Found! - EaseFind.AI");
            messageClass.getMethod("setText", String.class).invoke(message, "Hello " + userName + ",\n\n" +
                "Great news! Our AI Engine has found a strong potential match for the item: " + itemName + ".\n\n" +
                "Please log in to your dashboard to view the match results and securely interact with the other party!\n\n" +
                "Best regards,\n" +
                "The EaseFind.AI Security Team");

            Method sendMethod = mailSender.getClass().getMethod("send", messageClass);
            sendMethod.invoke(mailSender, message);
            
            System.out.println("SUCCESS: Email sent to " + toEmail);
        } catch (ClassNotFoundException e) {
            System.out.println("DEBUG EMAIL (Mock): Library not found yet. To: " + toEmail + " regarding " + itemName);
        } catch (Exception e) {
            System.err.println("FAILED to send email: " + e.getMessage());
        }
    }
}

