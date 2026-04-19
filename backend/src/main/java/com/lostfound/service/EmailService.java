package com.lostfound.service;

/** Force Re-Sync for Compiler **/

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;

@Service
public class EmailService {

    @Autowired
    private ApplicationContext context;

    public void sendMatchAlert(String toEmail, String userName, String itemName, String serialNumber) {
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
                "🔑 SECURITY KEY: " + (serialNumber != null ? serialNumber : "No key provided") + "\n\n" +
                "Please log in to your dashboard to view the match results and securely interact with the other party using the key above!\n\n" +
                "Best regards,\n" +
                "The EaseFind.AI Security Team");

            Method sendMethod = mailSender.getClass().getMethod("send", messageClass);
            sendMethod.invoke(mailSender, message);
            
            System.out.println("SUCCESS: Email sent to " + toEmail);
        } catch (ClassNotFoundException e) {
            System.out.println("DEBUG EMAIL (Mock): Library not found yet. To: " + toEmail + " regarding " + itemName);
        } catch (Exception e) {
            System.err.println("FAILED to send email to " + toEmail + ": " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendChatRequestAlert(String toEmail, String senderName, String itemName, String serialNumber) {
        try {
            Object mailSender = null;
            try {
                mailSender = context.getBean("mailSender");
            } catch (Exception e) {}

            if (mailSender == null) {
                System.out.println("DEBUG EMAIL (Mock Chat): To: " + toEmail + " | Msg: " + senderName + " wants to chat about " + itemName);
                return;
            }

            Class<?> messageClass = Class.forName("org.springframework.mail.SimpleMailMessage");
            Object message = messageClass.getDeclaredConstructor().newInstance();
            
            messageClass.getMethod("setFrom", String.class).invoke(message, "no-reply@easefindai.com");
            messageClass.getMethod("setTo", String.class).invoke(message, toEmail);
            messageClass.getMethod("setSubject", String.class).invoke(message, "Someone wants to chat! - EaseFind.AI");
            messageClass.getMethod("setText", String.class).invoke(message, "Hello,\n\n" +
                senderName + " has matching results with you and wants to start a secure chat regarding the item: " + itemName + ".\n\n" +
                "🔑 SECURITY KEY: " + (serialNumber != null ? serialNumber : "No key provided") + "\n\n" +
                "Please log in to your dashboard and open the match chat to reply using the key above!\n\n" +
                "Best regards,\n" +
                "The EaseFind.AI Team");

            Method sendMethod = mailSender.getClass().getMethod("send", messageClass);
            sendMethod.invoke(mailSender, message);
            
            System.out.println("SUCCESS: Chat request email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("FAILED to send chat email: " + e.getMessage());
        }
    }
}

