package com.ftn.sbnz.model.apartment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Window {

    private String roomId;
    private double width;
    private double height;
    private double parapetHeight;
    private Orientation orientation;
    private double glazedArea;
}