package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.LoginRequest;
import com.cafe.mark1.Dto.Request.ChangePasswordRequest;
import com.cafe.mark1.Dto.Request.UpdateUserRequest;
import com.cafe.mark1.Dto.Request.UserRequest;
import com.cafe.mark1.Dto.Response.AuthResponse;
import com.cafe.mark1.Dto.Response.UserResponse;
import com.cafe.mark1.Repository.UserRepository;
import com.cafe.mark1.Security.JwtUtils;
import com.cafe.mark1.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public UserResponse registerUser(UserRequest userRequest) {
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String encodedPassword = passwordEncoder.encode(userRequest.getPassword());

        User user = User.builder()
                .name(userRequest.getName())
                .email(userRequest.getEmail())
                .password(encodedPassword)
                .role(userRequest.getRole())
                .build();

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    public AuthResponse loginUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getIsArchived())) {
            throw new RuntimeException("User account is archived");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public UserResponse updateUser(Long id, UpdateUserRequest updateUserRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(updateUserRequest.getName());
        user.setRole(updateUserRequest.getRole());

        return mapToResponse(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public UserResponse toggleArchive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsArchived(!Boolean.TRUE.equals(user.getIsArchived()));

        return mapToResponse(userRepository.save(user));
    }

    public void changePassword(Long id, ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isArchived(Boolean.TRUE.equals(user.getIsArchived()))
                .build();
    }
}
