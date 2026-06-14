package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.TableRequest;
import com.cafe.mark1.Dto.Response.TableResponse;
import com.cafe.mark1.Repository.CafeTableRepository;
import com.cafe.mark1.Repository.FloorRepository;
import com.cafe.mark1.model.CafeTable;
import com.cafe.mark1.model.Floor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableService {

    private final CafeTableRepository cafeTableRepository;
    private final FloorRepository floorRepository;

    public List<TableResponse> getAllTables(Long floorId) {
        List<CafeTable> tables;
        if (floorId != null) {
            tables = cafeTableRepository.findByFloorId(floorId);
        } else {
            tables = cafeTableRepository.findAll();
        }
        return tables.stream().map(this::toDto).collect(Collectors.toList());
    }

    public TableResponse getTableById(Long id) {
        CafeTable table = cafeTableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));
        return toDto(table);
    }

    public TableResponse createTable(TableRequest dto) {
        if (cafeTableRepository.existsByTableNumber(dto.getTableNumber())) {
            throw new RuntimeException("Table number already exists: " + dto.getTableNumber());
        }

        Floor floor = floorRepository.findById(dto.getFloorId())
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + dto.getFloorId()));

        CafeTable table = CafeTable.builder()
                .tableNumber(dto.getTableNumber())
                .seats(dto.getSeats())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .hasActiveOrder(dto.getHasActiveOrder() != null ? dto.getHasActiveOrder() : false)
                .floor(floor)
                .build();

        return toDto(cafeTableRepository.save(table));
    }

    public TableResponse updateTable(Long id, TableRequest dto) {
        CafeTable table = cafeTableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));

        if (!table.getTableNumber().equals(dto.getTableNumber()) && 
            cafeTableRepository.existsByTableNumber(dto.getTableNumber())) {
            throw new RuntimeException("Table number already exists: " + dto.getTableNumber());
        }

        Floor floor = floorRepository.findById(dto.getFloorId())
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + dto.getFloorId()));

        table.setTableNumber(dto.getTableNumber());
        table.setSeats(dto.getSeats());
        if (dto.getIsActive() != null) table.setIsActive(dto.getIsActive());
        
        // hasActiveOrder is NOT updated manually via this CRUD endpoint
        // It will be managed by the Order module logic
        
        table.setFloor(floor);

        return toDto(cafeTableRepository.save(table));
    }

    public void deleteTable(Long id) {
        CafeTable table = cafeTableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));
        cafeTableRepository.delete(table);
    }

    private TableResponse toDto(CafeTable entity) {
        return TableResponse.builder()
                .id(entity.getId())
                .tableNumber(entity.getTableNumber())
                .seats(entity.getSeats())
                .isActive(entity.getIsActive())
                .hasActiveOrder(entity.getHasActiveOrder())
                .floorId(entity.getFloor().getId())
                .floorName(entity.getFloor().getName())
                .build();
    }
}