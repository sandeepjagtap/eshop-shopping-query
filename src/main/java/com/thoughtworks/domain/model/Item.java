package com.thoughtworks.domain.model;

//Entity
public class Item {

    private final String itemId;
    
    private final int quantity;

    public Item(String itemId, int quantity) {
        this.itemId = itemId;
        this.quantity = quantity;
    }

    public int getQuantity() {
        return quantity;
    }


    public String getItemId() {
        return itemId;
    }
}
