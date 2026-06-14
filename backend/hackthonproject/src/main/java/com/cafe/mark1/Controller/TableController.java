package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Request.TableRequest;
import com.cafe.mark1.Dto.Response.TableResponse;
import com.cafe.mark1.Service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TableController {

    private final TableService tableService;

    @GetMapping
    public ResponseEntity<List<TableResponse>> getAllTables(@RequestParam(required = false) Long floorId) {
        return ResponseEntity.ok(tableService.getAllTables(floorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TableResponse> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.getTableById(id));
    }

    @PostMapping
    public ResponseEntity<TableResponse> createTable(@Valid @RequestBody TableRequest request) {
        return ResponseEntity.ok(tableService.createTable(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TableResponse> updateTable(@PathVariable Long id, @Valid @RequestBody TableRequest request) {
        return ResponseEntity.ok(tableService.updateTable(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
}