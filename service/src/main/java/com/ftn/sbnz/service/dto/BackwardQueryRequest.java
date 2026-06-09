package com.ftn.sbnz.service.dto;

import com.ftn.sbnz.model.apartment.Apartment;
import com.ftn.sbnz.model.apartment.Building;
import com.ftn.sbnz.model.apartment.BuyerProfile;

public class BackwardQueryRequest {

    // Naziv upita: "potencijalZaVisokKomfor" ili "stanPogodanZaPorodicu"
    private String queryName;

    private Apartment apartment;
    private Building building;
    private BuyerProfile buyerProfile;

    public BackwardQueryRequest() {}

    public String getQueryName() { return queryName; }
    public void setQueryName(String queryName) { this.queryName = queryName; }

    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }

    public Building getBuilding() { return building; }
    public void setBuilding(Building building) { this.building = building; }

    public BuyerProfile getBuyerProfile() { return buyerProfile; }
    public void setBuyerProfile(BuyerProfile buyerProfile) { this.buyerProfile = buyerProfile; }
}