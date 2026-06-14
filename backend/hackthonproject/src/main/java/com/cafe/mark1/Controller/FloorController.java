package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Request.FloorRequest;
import com.cafe.mark1.Dto.Response.FloorResponse;
import com.cafe.mark1.Service.FloorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/floors")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FloorController {

    private final FloorService floorService;

    @GetMapping
    public ResponseEntity<List<FloorResponse>> getAllFloors() {
        return ResponseEntity.ok(floorService.getAllFloors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FloorResponse> getFloorById(@PathVariable Long id) {
        return ResponseEntity.ok(floorService.getFloorById(id));
    }

    @PostMapping
    public ResponseEntity<FloorResponse> createFloor(@Valid @RequestBody FloorRequest request) {
        return ResponseEntity.ok(floorService.createFloor(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FloorResponse> updateFloor(@PathVariable Long id, @Valid @RequestBody FloorRequest request) {
        return ResponseEntity.ok(floorService.updateFloor(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFloor(@PathVariable Long id) {
        floorService.deleteFloor(id);
        return ResponseEntity.noContent().build();
    }
}