package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.FloorRequest;
import com.cafe.mark1.Dto.Response.FloorResponse;
import com.cafe.mark1.Repository.FloorRepository;
import com.cafe.mark1.model.Floor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FloorService {

    private final FloorRepository floorRepository;

    public List<FloorResponse> getAllFloors() {
        return floorRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public FloorResponse getFloorById(Long id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + id));
        return toDto(floor);
    }

    public FloorResponse createFloor(FloorRequest dto) {
        if (floorRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Floor already exists with name: " + dto.getName());
        }

        Floor floor = Floor.builder()
                .name(dto.getName())
                .build();

        Floor savedFloor = floorRepository.save(floor);
        return toDto(savedFloor);
    }

    public FloorResponse updateFloor(Long id, FloorRequest dto) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + id));

        if (!floor.getName().equals(dto.getName()) && floorRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Floor already exists with name: " + dto.getName());
        }

        floor.setName(dto.getName());
        Floor updatedFloor = floorRepository.save(floor);
        return toDto(updatedFloor);
    }

    public void deleteFloor(Long id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + id));
        floorRepository.delete(floor);
    }

    private FloorResponse toDto(Floor entity) {
        return FloorResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }
}