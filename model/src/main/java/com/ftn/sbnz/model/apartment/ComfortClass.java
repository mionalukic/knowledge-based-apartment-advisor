package com.ftn.sbnz.model.apartment;

public enum ComfortClass {
    A,  // Excellent - no violations, at most 2 warnings
    B,  // Good - minor violations only, or many warnings
    C,  // Acceptable - 3 or more non-critical violations
    D   // Poor - at least one critical violation
}