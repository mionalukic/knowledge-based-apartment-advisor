package com.ftn.sbnz.service.service;

import com.ftn.sbnz.model.apartment.*;
import com.ftn.sbnz.service.dto.EvaluationResponse;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class ApartmentService {

    private final KieContainer kieContainer;

    @Autowired
    public ApartmentService(KieContainer kieContainer) {
        this.kieContainer = kieContainer;
    }

    public EvaluationResponse evaluate(Apartment apartment, Building building, BuyerProfile buyerProfile) {
        KieSession kSession = kieContainer.newKieSession("apartmentKSession");







        try {
            kSession.insert(apartment);

            if (building != null) {
                kSession.insert(building);
            }
            if (buyerProfile != null) {
                kSession.insert(buyerProfile);
            }
            if (apartment.getRooms() != null) {
                for (Room room : apartment.getRooms()) {
                    kSession.insert(room);
                }
            }
            if (apartment.getWindows() != null) {
                for (Window window : apartment.getWindows()) {
                    kSession.insert(window);
                }
            }
            if (apartment.getKitchenWalls() != null) {
                for (KitchenWall wall : apartment.getKitchenWalls()) {
                    kSession.insert(wall);
                }
            }
            if (apartment.getDeadAreas() != null) {
                for (DeadArea da : apartment.getDeadAreas()) {
                    kSession.insert(da);
                }
            }

            int firedRules = kSession.fireAllRules();
            System.out.println("=== Evaluation complete: " + firedRules + " rules fired ===");

            // Extract violations and warnings inserted by rules
            List<Violation> violations = extractFacts(kSession, Violation.class);
            List<Warning> warnings = extractFacts(kSession, Warning.class);
            List<DeadArea> deadAreas = extractFacts(kSession, DeadArea.class);
            List<Recommendation> recommendations = extractFacts(kSession, Recommendation.class);

            return new EvaluationResponse(apartment, firedRules, violations, warnings, deadAreas, recommendations);

        } finally {
            kSession.dispose();
        }
    }

    @SuppressWarnings("unchecked")
    private <T> List<T> extractFacts(KieSession kSession, Class<T> clazz) {
        Collection<?> facts = kSession.getObjects(o -> clazz.isInstance(o));
        List<T> result = new ArrayList<>();
        for (Object f : facts) {
            result.add((T) f);
        }
        return result;
    }
}