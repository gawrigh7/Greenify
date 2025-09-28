package org.greenify.greenify.service;

import org.greenify.greenify.model.User;
import org.greenify.greenify.model.UserPrincipal;
import org.greenify.greenify.repository.UserRepo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public User registerUser(User user) {
        if (userRepo.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepo.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    public User getByUserId(Long userId) {
        return userRepo.findById(userId).orElseThrow(() ->
                new UsernameNotFoundException("User id " + userId + " not found"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(username);
        if (user == null) throw new UsernameNotFoundException(username);
        return new UserPrincipal(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepo.existsById(userId)) {
            throw new UsernameNotFoundException("User id " + userId + " not found");
        }
        userRepo.deleteById(userId);
    }

    @Transactional
    public void changePassword(Long userId, String newPassword) {
        User user = getByUserId(userId);
        user.setPassword(encoder.encode(newPassword));
        userRepo.save(user);
    }

    @Transactional
    public void changeUsername(Long userId, String newUsername) {
        if (userRepo.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = getByUserId(userId);
        user.setUsername(newUsername);
        userRepo.save(user);
    }

    public boolean existsByUsername(String username) { return userRepo.existsByUsername(username); }
    public boolean existsByEmail(String email) { return userRepo.existsByEmail(email); }

}
