package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.AuthRequest;
import org.example.dashboardj.dto.AuthResponse;
import org.example.dashboardj.dto.RegisterRequest;
import org.example.dashboardj.entity.User;
import org.example.dashboardj.repository.UserRepository;
import org.example.dashboardj.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect email or password"));
        }

        final User user = userRepository.findByEmail(authRequest.getEmail()).orElseThrow();
        final String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getFullName());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .role("USER") // Default role is USER
                .build();

        userRepository.save(user);

        // Auto-login after registration
        final String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getFullName());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build());
    }
}