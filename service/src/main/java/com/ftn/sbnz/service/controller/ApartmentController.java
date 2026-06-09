package com.ftn.sbnz.service.controller;

import com.ftn.sbnz.service.dto.EvaluationRequest;
import com.ftn.sbnz.service.dto.EvaluationResponse;
import com.ftn.sbnz.service.service.ApartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apartments")
public class ApartmentController {

    private final ApartmentService apartmentService;

    @Autowired
    public ApartmentController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<EvaluationResponse> evaluate(@RequestBody EvaluationRequest request) {
        EvaluationResponse response = apartmentService.evaluate(request.getApartment(), request.getBuilding(), request.getBuyerProfile());
        return ResponseEntity.ok(response);
    }
}