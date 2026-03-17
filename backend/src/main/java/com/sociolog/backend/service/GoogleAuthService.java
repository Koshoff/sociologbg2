package com.sociolog.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
@Slf4j
public class GoogleAuthService {

    @Value("${app.google.client-id}")
    private String clientId;

    public String verifyAndGetGoogleId(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                log.warn("Invalid Google token");
                return null;
            }

            return idToken.getPayload().getSubject();
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            return null;
        }
    }
}