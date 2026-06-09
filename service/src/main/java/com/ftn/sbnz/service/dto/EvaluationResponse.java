package com.ftn.sbnz.service.dto;

import com.ftn.sbnz.model.apartment.*;

import java.util.List;

public class EvaluationResponse {

    private String apartmentId;
    private double totalNetUsableArea;
    private boolean crossVentilation;
    private List<Room> rooms;
    private List<KitchenWall> kitchenWalls;
    private List<DeadArea> deadAreas;
    private List<Violation> violations;
    private List<Warning> warnings;
    private int firedRules;
    private ApartmentStructure structure;
    private ComfortClass comfortClass;
    private List<Recommendation> recommendations;

    public EvaluationResponse() {}

    public EvaluationResponse(Apartment apartment, int firedRules,
                              List<Violation> violations, List<Warning> warnings,
                              List<DeadArea> deadAreas, List<Recommendation> recommendations) {
        this.apartmentId = apartment.getId();
        this.totalNetUsableArea = apartment.getTotalNetUsableArea();
        this.crossVentilation = apartment.isCrossVentilation();
        this.rooms = apartment.getRooms();
        this.kitchenWalls = apartment.getKitchenWalls();
        this.deadAreas = deadAreas;
        this.violations = violations;
        this.warnings = warnings;
        this.firedRules = firedRules;
        this.structure = apartment.getStructure();
        this.comfortClass = apartment.getComfortClass();
        this.recommendations = recommendations;
    }

    public String getApartmentId() { return apartmentId; }
    public void setApartmentId(String apartmentId) { this.apartmentId = apartmentId; }

    public double getTotalNetUsableArea() { return totalNetUsableArea; }
    public void setTotalNetUsableArea(double totalNetUsableArea) {
        this.totalNetUsableArea = totalNetUsableArea;
    }

    public boolean isCrossVentilation() { return crossVentilation; }
    public void setCrossVentilation(boolean crossVentilation) {
        this.crossVentilation = crossVentilation;
    }

    public List<Room> getRooms() { return rooms; }
    public void setRooms(List<Room> rooms) { this.rooms = rooms; }

    public List<KitchenWall> getKitchenWalls() { return kitchenWalls; }
    public void setKitchenWalls(List<KitchenWall> kitchenWalls) {
        this.kitchenWalls = kitchenWalls;
    }

    public List<DeadArea> getDeadAreas() { return deadAreas; }
    public void setDeadAreas(List<DeadArea> deadAreas) { this.deadAreas = deadAreas; }

    public List<Violation> getViolations() { return violations; }
    public void setViolations(List<Violation> violations) { this.violations = violations; }

    public List<Warning> getWarnings() { return warnings; }
    public void setWarnings(List<Warning> warnings) { this.warnings = warnings; }

    public int getFiredRules() { return firedRules; }
    public void setFiredRules(int firedRules) { this.firedRules = firedRules; }
    public ApartmentStructure getStructure() { return structure; }
    public void setStructure(ApartmentStructure structure) { this.structure = structure; }

    public ComfortClass getComfortClass() { return comfortClass; }
    public void setComfortClass(ComfortClass comfortClass) { this.comfortClass = comfortClass; }

    public List<Recommendation> getRecommendations() { return recommendations; }
    public void setRecommendations(List<Recommendation> recommendations) { this.recommendations = recommendations; }

}