package com.ftn.sbnz.model.apartment;

public enum BuyerProfileType {
    SINGLE,         // one person, flexible
    COUPLE,         // two adults, no children
    YOUNG_FAMILY,   // couple with young children (up to ~6 years)
    FAMILY,         // family with school-age or teenage children
    LARGE_FAMILY,   // 3+ children or multi-generational household
    RETIREE,        // elderly, accessibility and safety matter most
    INVESTOR        // buying for rental, tolerates more issues
}