package com.thoughtworks.domain.event;


public class ItemAddedEvent {

    private final String cartId;
    private final String itemId;
    private final int quantity;

    public ItemAddedEvent(String cartId, String itemId, int quantity) {

        this.cartId = cartId;
        this.itemId = itemId;
        this.quantity = quantity;
    }


    public String getCartId() {
        return cartId;
    }

    public String getItemId() {
        return itemId;
    }

    public int getQuantity() {
        return quantity;
    }
}
