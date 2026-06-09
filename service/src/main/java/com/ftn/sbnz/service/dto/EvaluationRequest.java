package com.ftn.sbnz.service.dto;

import com.ftn.sbnz.model.apartment.Apartment;
import com.ftn.sbnz.model.apartment.Building;
import com.ftn.sbnz.model.apartment.BuyerProfile;

public class EvaluationRequest {

    private Apartment apartment;
    private Building building;
    private BuyerProfile buyerProfile;

    public EvaluationRequest() {}

    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }

    public Building getBuilding() { return building; }
    public void setBuilding(Building building) { this.building = building; }

    public BuyerProfile getBuyerProfile() { return buyerProfile; }
    public void setBuyerProfile(BuyerProfile buyerProfile) { this.buyerProfile = buyerProfile; }
}