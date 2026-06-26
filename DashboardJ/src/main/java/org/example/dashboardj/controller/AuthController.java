package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.AuthRequest;
import org.example.dashboardj.dto.AuthResponse;
import org.example.dashboardj.dto.RegisterRequest;
import org.example.dashboardj.entity.User;
import org.example.dashboardj.repository.UserRepository;
import org.example.dashboardj.security.JwtUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest, HttpServletResponse response) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect email or password"));
        }

        final User user = userRepository.findByEmail(authRequest.getEmail()).orElseThrow();
        final String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getFullName());

        ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(5 * 60) // 5 minutes
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(null, user.getEmail(), user.getFullName(), user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest, HttpServletResponse response) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(null, registerRequest.getEmail(), passwordEncoder.encode(registerRequest.getPassword()), registerRequest.getFullName(), "USER");

        userRepository.save(user);

        // Auto-login after registration
        final String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getFullName());

        ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(5 * 60) // 5 minutes
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(null, user.getEmail(), user.getFullName(), user.getRole()));
    }
}