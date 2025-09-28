package org.greenify.greenify.controller;

import org.greenify.greenify.model.User;
import org.greenify.greenify.model.UserPrincipal;
import org.greenify.greenify.service.JWTService;
import org.greenify.greenify.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Validated
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authManager;
    private final JWTService jwtService;

    public UserController(UserService userService, AuthenticationManager authManager, JWTService jwtService) {
        this.userService = userService;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    public static record RegisterReq(
            @NotBlank String username,
            @NotBlank @Email String email,
            @NotBlank String password) {}
    public static record LoginReq(@NotBlank String username, @NotBlank String password) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterReq req) {
        User u = new User();
        u.setUsername(req.username());
        u.setEmail(req.email());
        u.setPassword(req.password());
        User saved = userService.registerUser(u);
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "username", saved.getUsername(),
                "email", saved.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        User user = userService.existsByUsername(req.username())
                ? userService.loadUserByUsername(req.username()) instanceof UserPrincipal up
                ? up.getUser() : null
                : null;
        if (user == null) return ResponseEntity.status(401).body("Invalid credentials");
        String token = jwtService.generateToken(user.getId(), user.getUsername());
        return ResponseEntity.ok(token);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserPrincipal me) {
        if (me == null) return ResponseEntity.status(401).build();
        User u = userService.getByUserId(me.getId());
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail()
        ));
    }

    @PutMapping("/me/username")
    public ResponseEntity<?> changeUsername(@AuthenticationPrincipal UserPrincipal me, @RequestBody Map<String, String> body) {
        if (me == null) return ResponseEntity.status(401).build();
        String newUsername = body.get("newUsername");
        userService.changeUsername(me.getId(), newUsername);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal me, @RequestBody Map<String, String> body) {
        if (me == null) return ResponseEntity.status(401).build();
        String newPassword = body.get("newPassword");
        userService.changePassword(me.getId(), newPassword);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> delete(@AuthenticationPrincipal UserPrincipal me) {
        if (me == null) return ResponseEntity.status(401).build();
        userService.deleteUser(me.getId());
        return ResponseEntity.noContent().build();
    }
}
