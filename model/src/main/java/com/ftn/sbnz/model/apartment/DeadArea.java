package com.ftn.sbnz.model.apartment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeadArea {

    private String roomId;
    private double areaM2;
    private String reason;
}