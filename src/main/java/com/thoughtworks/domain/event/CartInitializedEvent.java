package com.thoughtworks.domain.event;

public class CartInitializedEvent {
    private String id;

    public CartInitializedEvent(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }
}
