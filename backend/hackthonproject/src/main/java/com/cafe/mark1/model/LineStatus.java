package com.cafe.mark1.model;

public enum LineStatus {
    PENDING,    // Just ordered
    PREPPING,   // Cooking started
    READY,      // Ready to serve
    SERVED,     // Picked up by waiter
    CANCELLED   // Item removed
}