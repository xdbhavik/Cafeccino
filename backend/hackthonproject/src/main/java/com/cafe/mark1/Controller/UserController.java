package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Response.AuthResponse;
import com.cafe.mark1.Dto.Request.ChangePasswordRequest;
import com.cafe.mark1.Dto.Request.LoginRequest;
import com.cafe.mark1.Dto.Request.UpdateUserRequest;
import com.cafe.mark1.Dto.Request.UserRequest;
import com.cafe.mark1.Dto.Response.UserResponse;
import com.cafe.mark1.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(userService.registerUser(userRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.loginUser(loginRequest));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest updateUserRequest
    ) {
        return ResponseEntity.ok(userService.updateUser(id, updateUserRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<UserResponse> toggleArchive(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleArchive(id));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest
    ) {
        userService.changePassword(id, changePasswordRequest);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

}
