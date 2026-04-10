package com.lostfound.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendPasswordResetEmail(String to, String resetLink) {
        // Without spring-boot-starter-mail, we'll just print out the link!
        System.out.println("\n\n================================================");
        System.out.println("TEST EMAIL INTERCEPTED");
        System.out.println("To: " + to);
        System.out.println("Reset Link: " + resetLink);
        System.out.println("================================================\n\n");
    }
}
