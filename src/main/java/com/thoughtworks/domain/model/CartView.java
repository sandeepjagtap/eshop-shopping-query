package com.thoughtworks.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.couchbase.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

//Entity
@Document
public class CartView {

    @Id
    private String id;

    public List<Item> getItems() {
        return items;
    }

    private List<Item> items = new ArrayList<>();

    public CartView(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void add(Item item) {

        items.add(item);

    }
}
